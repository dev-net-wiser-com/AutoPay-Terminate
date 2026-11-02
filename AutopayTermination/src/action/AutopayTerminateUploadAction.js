import * as types from './AutopayTerminateUploadActionTypes';
import msgActions from './MsgActions';
import homeActions from './HomeAction';
import { getLoginName } from '../service/authutil';
import { getFileDownloadUrl } from '../service/service';
import { callSoap, uploadAttachment, queryString, parseList, languageOf, parseDate } from '../service/autopayApi';

const report = (dispatch, error) => dispatch(msgActions.incrementMsg('error', error.message || String(error)));
let nextFileKey = 0;
const actions = {
    initData: () => ({ type: types.INIT_DATA }),
    changeValue: (name, value) => ({ type: types.CHANGE_VALUE, name, value }),
    init: () => async dispatch => {
        dispatch(actions.initData());
        dispatch(homeActions.setFncMsgFilename('Autopay'));
        dispatch(actions.changeValue('isLoading', true));
        try {
            const [configXml, attachmentText, uploadPath] = await Promise.all([
                callSoap('hmms', 'getConfig'),
                callSoap('manager', 'selectAttachmentConfigByScreenIdAndRefId', { screenId: 'D.APT001', refId: 'TOKEN_BR' }),
                callSoap('autopay', 'fetchUploadPath')
            ]);
            const xml = new DOMParser().parseFromString(configXml, 'text/xml');
            const today = Array.from(xml.getElementsByTagName('*')).find(node => node.localName === 'today');
            const date = today ? today.textContent.trim() : '';
            if (!parseDate(date)) throw new Error('HMMSService did not return a valid business date.');
            const config = JSON.parse(attachmentText);
            if (!config || !/^\d+$/.test(String(config.id)) || Number(config.id) <= 0 ||
                config.screenId !== 'D.APT001' || config.refId !== 'TOKEN_BR') {
                throw new Error('Attachment configuration D.APT001 / TOKEN_BR is missing or invalid.');
            }
            if (!uploadPath.trim()) throw new Error('No upload directory was returned.');
            dispatch(actions.changeValue('date', date));
            dispatch(actions.changeValue('attachmentConfig', config));
            dispatch(actions.changeValue('uploadPath', uploadPath));
            await dispatch(actions.initLookupUploadLog());
            dispatch(actions.changeValue('ready', true));
        } catch (error) { report(dispatch, error); }
        finally { dispatch(actions.changeValue('isLoading', false)); }
    },
    initLookupUploadLog: () => async (dispatch, getState) => {
        const date = getState().AutopayTerminateUploadReducer.date;
        const list = parseList(await callSoap('autopay', 'lookupUploadLog', { date }));
        // Retain local files that have not yet been attempted when refreshing server records.
        const pending = getState().AutopayTerminateUploadReducer.uploadLogList.filter(row => row.uploadFlag);
        dispatch(actions.changeValue('uploadLogList', [...pending, ...list]));
    },
    appendFile: (_this, file) => (dispatch, getState) => {
        const state = getState().AutopayTerminateUploadReducer;
        if (!file || state.isLoading || !state.ready) return;
        try {
            const config = state.attachmentConfig;
            const extensions = String(config.uploadExtension || '').split(/[;,|\s]+/).filter(Boolean)
                .map(value => value.replace(/^\*?\.?/, '').toLowerCase());
            if (extensions.length && !extensions.includes('*') && !extensions.includes('.*') && !extensions.includes(file.name.split('.').pop().toLowerCase())) {
                throw new Error('The selected file type is not permitted by the attachment configuration.');
            }
            if (Number(config.uploadMaxSizeMb) > 0 && file.size > Number(config.uploadMaxSizeMb) * 1024 * 1024) {
                throw new Error('The selected file exceeds the configured upload size.');
            }
            if (state.uploadLogList.some(row => row.fileName === file.name &&
                (row.uploadFlag || row.uploadStatus === 'UPLOAD_SUCCESS' || row.processStatus === 'SUCCESS'))) {
                throw new Error('This filename is already selected or uploaded.');
            }
            if (Number(config.maxFileCount) > 0 && state.uploadLogList.filter(row => row.uploadFlag).length >= Number(config.maxFileCount)) {
                throw new Error('The configured file selection limit has been reached.');
            }
            dispatch(actions.changeValue('uploadLogList', [{ fileName: file.name, file, fileKey: ++nextFileKey, uploadFlag: true }, ...state.uploadLogList]));
        } catch (error) { report(dispatch, error); }
    },
    uploadFile: () => async (dispatch, getState) => {
        const { homeInfo, AutopayTerminateUploadReducer: state } = getState();
        if (state.isLoading || !state.ready) return;
        const loginName = getLoginName(homeInfo);
        if (!loginName) { report(dispatch, new Error('Sign in through iHousing before uploading.')); return; }
        dispatch(actions.changeValue('isLoading', true));
        const config = state.attachmentConfig;
        try {
            for (const row of state.uploadLogList.filter(item => item.uploadFlag)) {
                // Attempt each file once; do not automatically retry database writes after a failed response.
                const update = patch => dispatch(actions.changeValue('uploadLogList',
                    getState().AutopayTerminateUploadReducer.uploadLogList.map(item => item.fileKey === row.fileKey ? { ...item, ...patch } : item)));
                update({ uploadFlag: false, uploadStatus: 'UPLOADING' });
                try {
                    const data = new FormData();
                    data.append('Filedata', row.file); data.append('Filename', row.fileName); data.append('Upload', 'Submit Query');
                    const params = { filePath: state.uploadPath, screenId: config.screenId, refId: config.refId, category: 'upload', method: 'local' };
                    const storedName = await uploadAttachment(queryString(params), data);
                    const attachment = {
                        isDeletedByUser: 0, modifiedBy: null, fileSysName: storedName, refCode: 'APT001',
                        deletedByUser: null, atcId: Number(config.id), createdDate: null, modifiedDate: null, id: 0,
                        fileDownloadLink: getFileDownloadUrl({ screenId: config.screenId, refId: config.refId,
                            category: 'download', method: 'local', fileDisplayName: row.fileName, fileSysName: storedName }),
                        createdBy: loginName, deletedByDate: null, fileDisplayName: row.fileName, remark: '', deletedBySysDate: null
                    };
                    const id = await callSoap('manager', 'addAttachmentDetail', { jsonObject: JSON.stringify(attachment) });
                    if (!/^\d+$/.test(id.trim()) || Number(id) <= 0) throw new Error('Attachment save did not return a numeric ID.');
                    const result = await callSoap('autopay', 'newUploadLog', {
                        fileName: row.fileName, thru: 'D', uploadBy: loginName, status: 'UPLOAD_SUCCESS', atdID: id.trim()
                    });
                    // Legacy newUploadLog returns an empty string on success; Fail: is rejected by callSoap.
                    dispatch(msgActions.incrementMsg('info', `File '${row.fileName}' uploaded successfully.`));
                } catch (error) {
                    report(dispatch, new Error(`${row.fileName}: ${error.message}`));
                    // Stop the batch: the failed request may already have persisted a record.
                    break;
                }
            }
            await dispatch(actions.initLookupUploadLog());
        } catch (error) { report(dispatch, error); }
        finally { dispatch(actions.changeValue('isLoading', false)); }
    },
    toggleUploadDetailMessage: (_this, id) => async dispatch => {
        try {
            const list = parseList(await callSoap('autopay', 'getUploadDetailMessage', { aptId: id, includeCorrect: 'N' }));
            dispatch(actions.changeValue('uploadDetailList', list));
            dispatch(actions.changeValue('showFlag', true));
        } catch (error) { report(dispatch, error); }
    },
    toggleStartProcess: () => async (dispatch, getState) => {
        const { homeInfo, AutopayTerminateUploadReducer: state } = getState();
        if (state.isLoading || !state.ready) return;
        dispatch(actions.changeValue('isLoading', true));
        dispatch(actions.changeValue('startBtn', true));
        try {
            const result = await callSoap('autopay', 'inTakeLang', {
                uploadDate: state.date, screenId: state.attachmentConfig.screenId,
                refId: state.attachmentConfig.refId, language: languageOf(homeInfo)
            });
            if (!/^\d+$/.test(result.trim())) throw new Error(`Unexpected processing result: ${result}`);
            dispatch(msgActions.incrementMsg('info', `Process done. ${result} file(s) processed; check the status and detail messages.`));
        } catch (error) { report(dispatch, error); }
        finally {
            try { await dispatch(actions.initLookupUploadLog()); } catch (error) { report(dispatch, error); }
            dispatch(actions.changeValue('startBtn', false));
            dispatch(actions.changeValue('isLoading', false));
        }
    },
    deleteFile: (_this, index) => async (dispatch, getState) => {
        const state = getState().AutopayTerminateUploadReducer;
        if (state.isLoading) return;
        const row = state.uploadLogList[index];
        if (!row) return;
        dispatch(actions.changeValue('isLoading', true));
        try {
            if (row.id) await callSoap('autopay', 'deleteUploadLog', { ppsID: row.id });
            dispatch(actions.changeValue('uploadLogList', getState().AutopayTerminateUploadReducer.uploadLogList.filter(item => row.id ? String(item.id) !== String(row.id) : item.fileKey !== row.fileKey)));
        } catch (error) { report(dispatch, error); }
        finally { dispatch(actions.changeValue('isLoading', false)); }
    },
    returnMain: () => dispatch => dispatch(actions.changeValue('showFlag', false))
};
export default actions;
