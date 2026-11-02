// HTML5-Base common 2022.03.30
import * as actionTypes from '../action/MsgActionTypes';
import { fromJS } from "immutable";

const msgState = {
    msgShow: false,
    msgList: []
}


export default (state = msgState, action) => {

    switch (action.type) {
        case actionTypes.INCREMENT:
            return {
                msgShow: true,
                msgList: [{type:action.msgType,msg:action.msg},...state.msgList]
            }
        case actionTypes.HIDEMSG:
            return {
                ...state,
                msgShow: false
            }
        case actionTypes.CLEARMSG:
            return {
                msgList:[],
                msgShow: false
            }
        default:
            return state
    }

}