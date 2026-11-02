// CRA loads this only for npm start. Keep the 0.19.1 API used by the lockfile.
const proxy = require('http-proxy-middleware');
const { localAutopayBackendUrl, localBackendUrl } = require('./service/service');

const options = target => ({
    target,
    changeOrigin: true,
    cookieDomainRewrite: '',
    proxyTimeout: 120000,
    logLevel: 'warn',
    onProxyReq: proxyRequest => {
        // This is a server-to-server hop, not a browser cross-origin request.
        proxyRequest.removeHeader('origin');
    },
    onError: (error, request, response) => {
        console.error('[AutoPay development proxy]', error.code || 'Proxy request failed');
        if (!response.headersSent) {
            response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
        }
        response.end('The development proxy could not reach the upstream service.');
    },
});

module.exports = app => {
    app.use(proxy('/Autopay_Term_WS', options(localAutopayBackendUrl)));
    app.use(proxy(['/iHousing_WS', '/iHousing'], options(localBackendUrl)));
};
