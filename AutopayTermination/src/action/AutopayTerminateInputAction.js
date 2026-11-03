import * as types from './AutopayTerminateInputActionTypes';
import msgActions from './MsgActions';
import homeActions from './HomeAction';
import { getLoginName } from '../service/authutil';
import { dateToString } from '../service/util';
import { callSoap, languageOf, parseDate, encodeScreen } from '../service/autopayApi';

let nextRowId = 0;
const blankRow = date => ({ rowId: ++nextRowId, checked: false, propertyRef: '', paymentRef: '',
    terminationDate: date || '', tenancyName: '', payerName: '', payerAccount: '', lookupKey: '' });
const keyOf = row => `${row.propertyRef}\`${row.paymentRef}`;
const report = (dispatch, error) => dispatch(msgActions.incrementMsg('error', error.message || String(error)));
const actions = {
    initData: () => ({ type: types.INIT_DATA }),
    changeValue: (name, value) => ({ type: types.CHANGE_VALUE, name, value }),
    changeListValue: (name, index, key, value) => ({ type: types.CHANGE_LIST_VALUE, name, index, key, value }),
    init: () => async dispatch => {
        dispatch(actions.initData());
        dispatch(homeActions.setFncMsgFilename('Autopay'));
        dispatch(actions.changeValue('isLoading', true));
        try {
            const valueDate = await callSoap('autopay', 'GetValueDate');
            if (!parseDate(valueDate)) throw new Error('No valid termination date was returned by the backend.');
            dispatch(actions.changeValue('valueDate', valueDate));
        } catch (error) { report(dispatch, error); }
        finally { dispatch(actions.changeValue('isLoading', false)); }
    },
    addRows: () => async (dispatch, getState) => {
        const state = getState().AutopayTerminateInputReducer;
        if (state.isLoading || state.pendingLookups) return;
        if (state.terminationList.length) {
            const row = state.terminationList[0];
            if (!row.propertyRef || !row.paymentRef) {
                report(dispatch, new Error('Enter Property and Payment Reference before adding a row.')); return;
            }
            if (row.lookupKey !== keyOf(row) && !await dispatch(actions.lookupTenancyNameLang(null, 0))) return;
        }
        const current = getState().AutopayTerminateInputReducer;
        dispatch(actions.changeValue('terminationList', [blankRow(current.valueDate), ...current.terminationList]));
    },
    delRows: () => (dispatch, getState) => {
        const state = getState().AutopayTerminateInputReducer;
        if (!state.isLoading) dispatch(actions.changeValue('terminationList', state.terminationList.filter(row => !row.checked)));
    },
    changeCheck: (_this, index) => (dispatch, getState) => {
        const state = getState().AutopayTerminateInputReducer;
        dispatch(actions.changeListValue('terminationList', index, 'checked', !state.terminationList[index].checked));
    },
    datesFocusOutHandler: (_this, name, index, key, date) => dispatch =>
        dispatch(actions.changeListValue(name, index, key, date ? dateToString(date, 'DD/MM/YYYY') : '')),
    lookupTenancyNameLang: (_this, index) => async (dispatch, getState) => {
        const { homeInfo, AutopayTerminateInputReducer: state } = getState();
        const row = state.terminationList[index];
        if (!row || !row.propertyRef || !row.paymentRef) return false;
        const loginID = getLoginName(homeInfo);
        if (!loginID) { report(dispatch, new Error('Sign in through iHousing before querying accounts.')); return false; }
        if (/[`^\r\n]/.test(row.propertyRef + row.paymentRef)) return false;
        const key = keyOf(row);
        dispatch(actions.changeValue('pendingLookups', state.pendingLookups + 1));
        try {
            const result = await callSoap('autopay', 'lookupTenancyNameLang', {
                propertyRef: `${key}\`${loginID}\``, language: languageOf(homeInfo)
            });
            const fields = result.split('`');
            if (fields.length !== 3 || !fields[1] || !fields[2]) throw new Error('No valid payer account was returned.');
            const current = getState().AutopayTerminateInputReducer.terminationList;
            const position = current.findIndex(item => item.rowId === row.rowId && keyOf(item) === key);
            if (position < 0) return false;
            dispatch(actions.changeValue('terminationList', current.map((item, i) => i !== position ? item : {
                ...item, tenancyName: fields[0], payerName: fields[1], payerAccount: fields[2], lookupKey: key
            })));
            return true;
        } catch (error) { report(dispatch, error); return false; }
        finally {
            dispatch(actions.changeValue('pendingLookups', Math.max(0, getState().AutopayTerminateInputReducer.pendingLookups - 1)));
        }
    },
    save: () => async (dispatch, getState) => {
        const { homeInfo, AutopayTerminateInputReducer: state } = getState();
        if (state.isLoading || state.pendingLookups) return;
        const rows = state.terminationList.filter(row => !row.checked);
        const loginID = getLoginName(homeInfo);
        try {
            if (!rows.length) throw new Error('There are no rows to save.');
            if (!loginID) throw new Error('Sign in through iHousing before saving.');
            const minimum = parseDate(state.valueDate);
            if (!minimum) throw new Error('Reload the page to obtain the minimum termination date.');
            rows.forEach((row, i) => {
                const date = parseDate(row.terminationDate);
                if (!date || date < minimum) throw new Error(`Row ${i + 1}: invalid termination date.`);
                if (!row.propertyRef || !row.paymentRef || !row.payerName || !row.payerAccount || row.lookupKey !== keyOf(row)) {
                    throw new Error(`Row ${i + 1}: complete the account lookup before saving.`);
                }
            });
            const screenInputs = encodeScreen(rows);
            dispatch(actions.changeValue('isLoading', true));
            const result = await callSoap('autopay', 'saveScreenLang', {
                screenInputs, screenId: 'D.APT001', loginID, language: languageOf(homeInfo)
            });
            if (!/^\d+$/.test(result.trim()) || Number(result) !== rows.length) {
                throw new Error(`Unexpected save result: ${result}. Check the backend before submitting again.`);
            }
            dispatch(actions.changeValue('terminationList', []));
            dispatch(actions.changeValue('rowEdit', -1));
            dispatch(actions.changeValue('rowMouseOver', -1));
            dispatch(msgActions.incrementMsg('info', `${result} termination record(s) saved.`));
        } catch (error) { report(dispatch, error); }
        finally { dispatch(actions.changeValue('isLoading', false)); }
    }
};
export default actions;
