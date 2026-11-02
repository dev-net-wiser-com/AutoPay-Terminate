// HTML5-Base template 2022.03.30
import { combineReducers } from 'redux';
import homeReducer from './HomeReducer';
import msgReducer from './MsgReducer';
import AutopayTerminateInputReducer from './AutopayTerminateInputReducer';
import AutopayTerminateUploadReducer from './AutopayTerminateUploadReducer';
// HTML5-Base template: define module specific default reducer
// import defaultReducer from './WTPReducer';
// HTML5-Base template: add more reducer when needed
// import xxxReducer from './xxxReducer';

const rootReducer = combineReducers({
    homeInfo:homeReducer,
    msgData:msgReducer,
    AutopayTerminateInputReducer: AutopayTerminateInputReducer,
    AutopayTerminateUploadReducer: AutopayTerminateUploadReducer,
    // recordData:defaultReducer
    // HTML5-Base template: add more reducer when needed
});

export default rootReducer;