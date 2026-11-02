// HTML5-Base common 2022.03.30
import { INCREMENT, DECREMENT, HIDEMSG, CLEARMSG } from './MsgActionTypes';

let msgActions = {

    incrementMsg: (type,msg) => {
        return {
            type: INCREMENT,
            msgType:type,
            msg: msg
        }
    },

    decrementMsg: (msg) => ({
        type: DECREMENT,
        msg: msg
    }),

    hideMsg: () => ({
        type: HIDEMSG
    }),

    clearMsg: () => ({
        type: CLEARMSG
    }),
}

export default msgActions;