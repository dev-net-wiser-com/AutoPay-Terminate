import { GET_SERVICE_URL } from './service';
// HTML5-Base template 2022.11.17
// This is the moduleSpecific setting
import * as SERVICE_PROXY from './serviceProxy';

export const ModParam = {
    
  //  HTML5-Base template: Change the setting below
     appName: "autopay", // App Name. Use in App.js and HeadDropdown. For example, appName: "emms"
  //  End - HTML5-Base template: 
};


 //  HTML5-Base template: Change the setting below
    // If there is are any sub URL to access a function, input them below. 
    // For exapmle, a function W9 record have the entry URL H5_emms_w9record. 
    // When click the button [detail], it will show the page in url H5_emms_w9record_detail. 
    // Then record the relationship as commented sample below, 
    // so to configure the access right checking of [H5_emms_w9record_detail] is same as [H5_emms_w9record].
    // Input for all child pages in the array.
const pageEntry = [

  /*
  {
   "childPagePath": "/H5_emms_w9record_detail",
   "entryPath": "/H5_emms_w9record"
  },
  */
];
//  End - HTML5-Base template: 

export const getChildPageEntryPaths = (path) => {
  for(let obj of pageEntry) {
    if (obj["childPagePath"] == path)
      return obj;
  }
  return null;
}



export const hmmsSoapService = (method, params, success, error) =>
  SERVICE_PROXY.postSoapServiceJson(GET_SERVICE_URL.hmmsWebServiceUrl, GET_SERVICE_URL.hmmsNamespaceURL, method, params, success, error);
export const managerSoapService = (method, params, success, error) =>
  SERVICE_PROXY.postSoapServiceJson(GET_SERVICE_URL.managerWebServiceURL, GET_SERVICE_URL.managerNamespaceURL, method, params, success, error);
export const autopaySoapService = (method, params, success, error) =>
  SERVICE_PROXY.postSoapServiceJson(GET_SERVICE_URL.autopayServiceURL, GET_SERVICE_URL.namespaceURL, method, params, success, error);
