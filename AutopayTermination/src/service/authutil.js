// HTML5-Base common 2022.11.15
//utitilty for authenication and authorization 

import { getChildPageEntryPaths } from './moduleSetting';
import { r_n, rDecode, ROT47, ROTn } from './util';

//check if the userprofile contains PMD Admin
export const isITSAdmin = (userprofile) => {
  if (userprofile==null) return false;
  return userprofile.indexOf("HMMS_ITS_ADMIN")>=0;
}


//check if the userprofile contains PMD Admin
export const isPMDAdmin = (userprofile) => {
  if (userprofile==null) return false;
  return userprofile.indexOf("HMMS_PMD_ADMIN")>=0;
}

//added by ylb 20220419
// Get from homeInfo, then session.
export const getLoginName = (homeInfo) => {
  let rtn= null;
  if (homeInfo!=null) {
    rtn = homeInfo.loginName;
  } else {
    console.log('Warning, to make authutil.getLoginName returns correctly, please pass param homeInfo. ');
  }

  if (rtn == null) {
    let value = sessionStorage['loginid'];
    if (value == null || value === undefined || value == '') {
      //hard code for local test
      rtn = null;
      // rtn = 'hwlee';
    } else if (value.indexOf("{") >= 0) {
      rtn = JSON.parse(value);
    }
  }
  return (rtn==null? '':rtn.toUpperCase());
}


//added 2022.09.26
//Get the user profile from homeInfo (HomeReducer), which is kept in state in 
export const getUserProfile = (homeInfo) => {
  let rtn = homeInfo.up;
  if (rtn == null || rtn === undefined ) {
    rtn = '';
  }
  return rtn;
}

// decode ps to JavaScript object
export const decodeSessionSecret = (str) => {
  let paramsStr = "";
  if (str != null && str !== "") {
    paramsStr = rDecode(decodeURIComponent(str));
  } else { return null }
  let arr = paramsStr.split('&');
  let params = {}
  for (let i = 0; i < arr.length; i++) {
    let data = arr[i].split('=')
    if (data.length === 2) {
      params[data[0]] = data[1]
    }
  }
  return params
}

// Encode JavaScript to ps param
export function encodeSessionSecret(id, up) {
  //from main.jsp  executeH5
  //var platform="D.Main";
  //var systemName = "iHousing";
  //var version = "Version local test";
  //var resolution =  "Best Resolution is 1280*768"
  var para = "ts=" + new Date().getTime() / 1000;
  para += "&loginid=" + id + "&up=" + up;
  // para += "&platform=" + platform + "&systemName=" + systemName + "&version=" + version + "&resolution=" + resolution;
  var paraEncode = ROT47(para);
  paraEncode = encodeURIComponent(paraEncode); 

  return paraEncode;
}

const getModulesName = (menu) => {
  let arr = "";
  if (!menu) return "";
  for(let i = 0; i < menu.length; i++) {
    if (menu[i].menuitem?.submenus.length > 0) {
      arr += getModulesName(menu[i].menuitem.submenus);
    }
    else {
      let str = menu[i].menuitem?.moduleName.split('@')[0];
      if(str && str.startsWith("H5"))
        arr += '/' + str + ' ';
      }
  }
  return arr;
}

const allowedPaths = ["/", "/iHousing_home"];

export const extractPermittedPaths = (menu) => {
  return getModulesName(menu).split(' ');
}


export const isPathPermitted = (path, permittedPaths) => {
  // Local development will not check permitted paths
  if (window.location.host.includes("localhost")) {
    console.log(`Skip permission check on localhost. Path-[${path}]`);
    return { isPermitted: true, isChild: false, entryPath: null };
  }
  if (!permittedPaths || permittedPaths?.length == 0) return { isPermitted: false, isChild: false, entryPath: null };
  let pageEntry = getChildPageEntryPaths(path);
  path = pageEntry ? pageEntry["entryPath"] : path;
  let result = { isPermitted: permittedPaths.concat(allowedPaths).includes(path), isChild: (pageEntry === null ? false : true), entryPath: path };
  return result;
}

