const letssl = require('letssl');
const fs = require('fs').promises;
const path = require('path');

const generateSSLCertificate = async (domain) => {
    try{
        const storagePath = path.join(__dirname, '..', 'storage', domain);
        await fs.mkdir(storagePath, { recursive: true });
        const [key, cert] = await letssl.getCertificate({ 
            commonName: domain,
            builtInServerPort: 5520
        });
        await fs.writeFile(path.join(storagePath, 'key.pem'), key);
        await fs.writeFile(path.join(storagePath, 'cert.pem'), cert);
    }catch(error){
        console.log('[Quantum Cloud] CRITICAL ERROR (at @utilities/generateSSLCertificate):', error);
    }
};

module.exports = generateSSLCertificate;