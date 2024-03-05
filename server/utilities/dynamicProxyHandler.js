const httpProxy = require('http-proxy');
const generateSSLCertificate = require('@utilities/generateSSLCertificate');
const proxyServer = httpProxy.createProxyServer({});

const dynamicProxyHandler = async (req, res, next) => {
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
        return next();
    }
    const [key, cert] = await generateSSLCertificate(requestedDomain);
    const proxyOptions = {
        target: `http://0.0.0.0:${userServicePort}`,
        ssl: { key, cert }
    };
    proxyServer.web(req, res, proxyOptions, (error) => {
        if(error.code === 'ECONNREFUSED'){
            res.status(200).json({
                status: 'success',
                data: { message: 'We are setting up the domain, please wait...' }
            });
            return;
        }
        throw error;
    });
};

module.exports = dynamicProxyHandler;