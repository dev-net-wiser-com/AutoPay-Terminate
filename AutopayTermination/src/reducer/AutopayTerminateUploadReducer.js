import * as types from '../action/AutopayTerminateUploadActionTypes';
const initialState = { searchParam: {}, rowEdit: -1, rowMouseOver: -1, detailRowEdit: -1,
    detailRowMouseOver: -1, date: '', attachmentConfig: {}, uploadPath: '', uploadLogList: [],
    uploadDetailList: [], attachObj: {}, showFlag: false, startBtn: false, isLoading: false, ready: false };
export default (state = initialState, action) => {
    switch (action.type) {
        case types.INIT_DATA: return { ...initialState, uploadLogList: [], uploadDetailList: [], attachmentConfig: {}, searchParam: {}, attachObj: {} };
        case types.CHANGE_VALUE: return { ...state, [action.name]: action.value };
        case types.CHANGE_VALUE_PARAM: return { ...state, searchParam: { ...state.searchParam, [action.name]: action.value } };
        default: return state;
    }
};
