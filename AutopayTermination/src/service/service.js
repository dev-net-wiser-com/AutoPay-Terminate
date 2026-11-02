// All target addresses stay here; setupProxy.js reads the same configuration.
// CommonJS also allows the Node 14 development server to load this file.
// Local integration now targets the same 47 container for all services.
const localAutopayBackendUrl = 'http://192.9.200.47:8080';
const localBackendUrl = 'http://192.9.200.47:8080';
const hasWindow = typeof window !== 'undefined';
const currentOrigin = hasWindow ? window.location.origin : '';
const isLocalHost = hasWindow &&
    ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
const useDevelopmentProxy = isLocalHost && process.env.NODE_ENV === 'development';

// npm start sends API requests to its own origin; setupProxy forwards them.
// Published WARs continue to use their deployment origin.
const SERVICE_BASE_URL = useDevelopmentProxy ? currentOrigin :
    (isLocalHost ? localBackendUrl : currentOrigin);
const AUTOPAY_SERVICE_BASE_URL = useDevelopmentProxy ? currentOrigin :
    (isLocalHost ? localAutopayBackendUrl : currentOrigin);
const sharedApplicationOrigin = isLocalHost ? localBackendUrl : currentOrigin;

const resolveServiceUrl = (url) => {
    if (/^https?:\/\//i.test(url)) return url;
    return SERVICE_BASE_URL + (url.startsWith('/') ? url : '/' + url);
};

const GET_SERVICE_URL = {
    defaultServiceUrl: AUTOPAY_SERVICE_BASE_URL + '/Autopay_Term_WS/services/AutopayTermService/',
    autopayServiceURL: AUTOPAY_SERVICE_BASE_URL + '/Autopay_Term_WS/services/AutopayTermService.AutopayTermServiceHttpSoap11Endpoint/',
    defaultUploadServiceURL: resolveServiceUrl('/iHousing/FileHandleServlet'),
    menuUrl: resolveServiceUrl('/iHousing_WS/services/MenuWebService/'),
    hmmsWebServiceUrl: resolveServiceUrl('/iHousing_WS/services/HMMSService/'),
    managerWebServiceURL: resolveServiceUrl('/iHousing_WS/services/ManagerWebService/'),
    baseUrl: sharedApplicationOrigin + '/',
    iHousingUrl: sharedApplicationOrigin + '/',
    iHousingH5ToFlexUrl: sharedApplicationOrigin + '/iHousing/mainForH5.jsp',
    iHousingLandingUrl: sharedApplicationOrigin + '/iHousingH5/index.html',
    namespaceURL: 'http://pps.hmms.hkhs.com',
    hmmsNamespaceURL: 'http://www.hkhs.com',
    managerNamespaceURL: 'http://webservice.hmms.hkhs.com',
};

const getFileDownloadUrl = (params) => {
    const query = Object.keys(params).map(key =>
        encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    ).join('&');
    // Attachment records must not persist the temporary localhost:3000 proxy URL.
    return sharedApplicationOrigin + '/iHousing/FileHandleServlet?' + query;
};

module.exports = {
    localAutopayBackendUrl,
    localBackendUrl,
    SERVICE_BASE_URL,
    AUTOPAY_SERVICE_BASE_URL,
    resolveServiceUrl,
    GET_SERVICE_URL,
    getFileDownloadUrl,
};
