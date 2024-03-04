const httpProxy = require('http-proxy');
const proxyServer = httpProxy.createProxyServer({});

const dynamicProxyHandler = (req, res, next) => {
    const requestedDomain = req.hostname;
    const userServicePort = global.repositoryDomains.get(requestedDomain);
    if(!userServicePort){
        return next();
    }
    proxyServer.web(req, res, { target: `http://0.0.0.0:${userServicePort}` });
};

module.exports = dynamicProxyHandler;