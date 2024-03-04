const httpProxy = require('http-proxy');
const proxyServer = httpProxy.createProxyServer({});

const dynamicProxyHandler = (req, res, next) => {
    const requestedDomain = req.hostname;
    // When a user service is loaded during runtime, it undergoes
    // a check to determine if it includes domains along with their 
    // associated ports. If such information is present, the system
    // will actively listen for requests directed to these domains, 
    // redirecting them to the specified ports. The 
    // "global.repositoryDomains" variable represents a "Map()" data 
    // structure, wherein each domain serves as a key mapped to its 
    // corresponding local port value.
    const userServicePort = global.repositoryDomains.get(requestedDomain);
    if(!userServicePort){
        // If no domain is found, we will assume it is ume it is an API call.
        return next();an API call.
        return next();
    }
    proxyServer.web(req, res, { target: `http://0.0.0.0:${userServicePort}` });
};

module.exports = dynamicProxyHandler;