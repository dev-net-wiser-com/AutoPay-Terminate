// HTML5-Base common 2022.11.17
import {fromJS} from "immutable";
import { GET_SERVICE_URL } from '../service/serviceProxy';
import { SysParm } from '../service/settings';

// System Message 
import SystemMessageFile_en_US from '../i18n/GlobalMessage_en_US';
import SystemMessageFile_zh_HK from '../i18n/GlobalMessage_zh_HK';

const dfLang = SysParm.DefaultLanguage;     //"en_US"

const SystemMessageFiles = {
    en_US: SystemMessageFile_en_US,
    zh_HK: SystemMessageFile_zh_HK
}

const FunctionMessageFiles = {
    default: {
        en_US: {},
        zh_HK: {}
    },
}

const initialState = {
    language: "en_US",
    fontsize: "l-app",
    today: "",
    loginName: "",
    up: "",     //user profile
    menuInfo: {
        menus: [],
        url: GET_SERVICE_URL.baseUrl,
        iHousingUrl: "",
        appName: ""
    },
    platform: "",
    filename: "",
    msgFiles: FunctionMessageFiles["default"],
    fncMsg: FunctionMessageFiles["default"][dfLang],
    sysMsg: SystemMessageFiles[dfLang],
    permittedPaths: [],
    errorPage: {
        isNoPermission: false,
        resources: "",
        errorMsg: ""
    }
};


export default (state = initialState, action) => {

    switch (action.type) {
        case "home/CHANGE_VALUE":
            return fromJS(state).set(action.name,action.value).toJS();
        case "home/CHANGE_VALUE_JO":
            return fromJS({ ...state, ...action.value }).toJS();

        case 'home/CHANGELANG':
            return {
                ...state,
                language: action.language,
                sysMsg: SystemMessageFiles[action.language],
                fncMsg: state.msgFiles[action.language]
            }
        case 'home/CHANGEFILE':
            state = {
                ...state,
                fncMsg: action.file[state.language],
                msgFiles: action.file
                
            }

            return fromJS(state).toJS();

            case 'home/SET_FNCMSG_FILENAME':
                let file = getMessageFiles(action.filename);
                state = {
                    ...state,
                    fncMsg: file[state.language],
                    msgFiles: file
    
                }
      
                return fromJS(state).toJS();
    
            default:
            return state;
    }

};

const defaultObj = {
	en_US: {},
	zh_HK: {},
}

export const getMessageFiles = (filename) => {

	let FunctionMessageFile_en_US;
	let FunctionMessageFile_zh_HK;
	let zhHkFlag = false;
	let enUSFlag = false;

	try {
		FunctionMessageFile_en_US = require(`../i18n/${filename}_en_US`).default;
	}
	catch (e) {
		// alert(`Message file ${filename} missing.`);
		console.log(`Message file ${filename}_en_US missing.`);
		enUSFlag = true;
	}

	try {
		FunctionMessageFile_zh_HK = require(`../i18n/${filename}_zh_HK`).default;
	}
	catch (e) {
		// alert(`Message file ${filename} missing, try to set to en_US.`);
		console.log(`Message file ${filename}_zh_HK missing` + (enUSFlag?`.`:`, set to en_US.`));
		zhHkFlag = true;
	}


	if (enUSFlag && zhHkFlag) return defaultObj;
	if (zhHkFlag && !enUSFlag) return { en_US: FunctionMessageFile_en_US, zh_HK: FunctionMessageFile_en_US };
	return {
		en_US: FunctionMessageFile_en_US,
		zh_HK: FunctionMessageFile_zh_HK
	}
}
