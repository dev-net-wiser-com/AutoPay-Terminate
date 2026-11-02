import * as types from '../action/AutopayTerminateInputActionTypes';
const initialState = { searchParam: {}, rowEdit: -1, rowMouseOver: -1, terminationList: [],
    valueDate: '', isLoading: false, pendingLookups: 0 };
export default (state = initialState, action) => {
    switch (action.type) {
        case types.INIT_DATA: return { ...initialState, terminationList: [], searchParam: {} };
        case types.CHANGE_VALUE: return { ...state, [action.name]: action.value };
        case types.CHANGE_LIST_VALUE: {
            const rows = state[action.name].map((row, index) => {
                if (index !== action.index) return row;
                const updated = { ...row, [action.key]: action.value };
                if (['propertyRef', 'paymentRef'].includes(action.key) && row[action.key] !== action.value) {
                    Object.assign(updated, { lookupKey: '', tenancyName: '', payerName: '', payerAccount: '' });
                }
                return updated;
            });
            return { ...state, [action.name]: rows };
        }
        case types.CHANGE_VALUE_PARAM: return { ...state, searchParam: { ...state.searchParam, [action.name]: action.value } };
        case types.CHANGE_OBJECT_VALUE: return { ...state, [action.objName]: { ...state[action.objName], [action.name]: action.value } };
        default: return state;
    }
};
