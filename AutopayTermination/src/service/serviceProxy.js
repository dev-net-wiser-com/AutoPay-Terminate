// HTML5-Base common 2022.11.22 
import $ from "jquery";
import $soap from 'jquery.soap';

import { GET_SERVICE_URL, resolveServiceUrl } from './service';
export { GET_SERVICE_URL } from './service';
const getUrl = resolveServiceUrl;

// Common WS
export const uploadService = (method, data, successFun, errorFun) => {
    $.ajax({
        url: GET_SERVICE_URL.defaultUploadServiceURL + "?" + method,
        type: "POST",
        data: data,
        processData: false,
        contentType: false,
        success: function (soapResponse) {
            successFun(soapResponse);
        },
        error: function (r) {
            if (errorFun)
                errorFun(r);
        },
        failure: function (r) {
        }
    });
}

export const callMenuService = (method, data, successFun) => {
    $.ajaxSettings.async = false;
    $.get(GET_SERVICE_URL.menuUrl + method + data,
        (soapResponse) => {
            if (soapResponse.documentElement) {
                var str = soapResponse.documentElement.childNodes[0].childNodes[0].nodeValue;
                if (str === null || str === "null" || str === "") {
                    console.log("callMenuService return null.");
                    str = [];
                }
                try {
                    str = JSON.parse(htmlDecodeByRegEx(str));
                    
                } catch (e) {
                    console.log(`callMenuService return error. Message-[${str}]`);
                    str = [];
                }
                successFun(str);
            }
        });
    $.ajaxSettings.async = true;
}

export const getSoapServiceJson = (url, method, params, successFun, errorFun) => {
    
    $.ajax({
        url: getUrl(url + method),
        type: "GET",
        processData: false,
        contentType: false,
        success: function (soapResponse) {
            let str = soapResponse.documentElement.childNodes[0].nodeValue;
            if (str && typeof (str) != 'object')
                str = JSON.parse(str);
            successFun(str);
        },
        error: function (r) {
            if (errorFun)
                errorFun(r);
        },
        failure: function (r) {
        }
    });
}

export const getSoapServiceXML = (url, method, params, successFun, errorFun) => {

    $.ajax({
        url: getUrl(url + method),
        type: "GET",
        processData: false,
        contentType: false,
        success: function (soapResponse) {
            let soapResponseCopy = soapResponse;
            soapResponseCopy['content']['all'][3]['textContent'] = htmlDecodeByRegEx(soapResponseCopy['content']['all'][3]['textContent']);
            successFun(soapResponseCopy);
        },
        error: function (r) {
            if (errorFun)
                errorFun(r);
        },
        failure: function (r) {
        }
    });
}

export const postSoapServiceJson = (url, namespaceURL, method, params, successFun, errorFun) => {
    
    $.soap({
        url: getUrl(url),
        method: method,
        type: "POST",
        enableLogging: false,
        appendMethodToURL: false,
        namespaceURL: namespaceURL,
        data: params,
        success: successFun,
        error: errorFun,
        timeout: 120000,
    });
}

export const postSoapServiceXML = (url, namespaceURL, method, params, successFun, errorFun) => {

    $.soap({
        url: getUrl(url),
        method: method,
        type: "POST",
        enableLogging: false,
        appendMethodToURL: false,
        namespaceURL: namespaceURL,
        data: htmlEncodeByRegEx(params),
        success: function (soapResponse) {
            let soapResponseCopy = soapResponse;
            soapResponseCopy['content']['all'][3]['textContent'] = htmlDecodeByRegEx(soapResponseCopy['content']['all'][3]['textContent']);
            successFun(soapResponseCopy);
        },
        error: errorFun,
        timeout: 120000,
    });
}

// Decode and Encode functions for XML format payload and response web services 
export const htmlDecodeByRegEx = function (str) {
    var s = "";
    if(str.length == 0) return "";
    s = str.replace(/&amp;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    return s;
}

export const htmlEncodeByRegEx = function (obj) {
    for (let key in obj) {
        if (!obj[key]) continue;
        let lt, gt, start, end;
        for (let k = 0; k < obj[key].length; k++) {
            if (k + 1 && obj[key][k] == '<' && obj[key][k+1] != '/')
                start = true;
            else if (k + 1 && obj[key][k] == '<' && obj[key][k+1] == '/') {
                end = true;
                start = false;
            }
            if (obj[key][k] == '>' && start)
                lt = k;
            if (k + 1 < obj[key].length && obj[key][k] + obj[key][k+1] == '</')
                gt = k;
            if (lt && gt && end && !start) {
                let replacement = obj[key].substring(lt+1, gt).replace(/</g, '&lt;').replace(/&/g, "&amp;");
                obj[key] = obj[key].substring(0, lt+1) + replacement + obj[key].substring(gt, obj[key].length)
                lt = null;
                gt = gt ? null : gt;
            }
        }    
    }

    return obj;
}
