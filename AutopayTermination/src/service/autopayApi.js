import { autopaySoapService, managerSoapService, hmmsSoapService } from './moduleSetting';
import { uploadService } from './serviceProxy';

// Match localName rather than a server-specific prefix (Axis2 ns:, CXF ns2:, etc.).
export const readSoapResult = response => {
    const xml = response && response.toXML ? response.toXML() : response;
    if (!xml || !xml.getElementsByTagName) throw new Error('Invalid SOAP response.');
    const elements = Array.from(xml.getElementsByTagName('*'));
    const fault = elements.find(node => node.localName === 'Fault');
    if (fault) throw new Error(fault.textContent || 'SOAP request failed.');
    const result = elements.find(node => node.localName === 'return');
    if (!result) throw new Error('SOAP response has no return value.');
    const value = result.textContent || '';
    if (/^\s*fail\s*:/i.test(value)) throw new Error(value.trim());
    return value;
};

export const callSoap = (service, method, params = {}) => new Promise((resolve, reject) => {
    const proxy = { autopay: autopaySoapService, manager: managerSoapService, hmms: hmmsSoapService }[service];
    proxy(method, params, response => {
        try { resolve(readSoapResult(response)); } catch (error) { reject(error); }
    }, () => reject(new Error(`${method} failed. Check the service connection and server logs.`)));
});

export const uploadAttachment = (query, data) => new Promise((resolve, reject) => {
    uploadService(query, data, value => {
        const name = typeof value === 'string' ? value.trim() : '';
        if (!name || /^\s*(fail|error)\b/i.test(name) || /[<>\r\n]/.test(name)) {
            reject(new Error('File upload did not return a valid stored filename.'));
        } else resolve(name);
    }, () => reject(new Error('File upload failed. Check the upload service.')));
});

export const parseList = value => {
    const list = JSON.parse(value);
    if (!Array.isArray(list)) throw new Error('The service did not return a list.');
    return list;
};

export const queryString = params => Object.keys(params).map(key =>
    `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');

export const languageOf = home => home.language || 'en_US';

export const parseDate = value => {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || '');
    if (!match) return null;
    const date = new Date(+match[3], +match[2] - 1, +match[1]);
    return date.getFullYear() === +match[3] && date.getMonth() === +match[2] - 1 &&
        date.getDate() === +match[1] ? date : null;
};

// Legacy saveScreenLang format: six fields separated by `, records separated by ^.
export const encodeScreen = rows => rows.map(row => {
    const values = [row.propertyRef, row.paymentRef, row.terminationDate,
        row.tenancyName, row.payerName, row.payerAccount];
    if (values.some(value => /[`^\r\n]/.test(String(value || '')))) {
        throw new Error('Input contains a reserved separator or line break.');
    }
    return values.join('`');
}).join('^');
