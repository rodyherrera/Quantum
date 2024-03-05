const letssl = require('letssl');
const fs = require('fs').promises;
const path = require('path');

// https://letsencrypt.org/docs/too-many-registrations-for-this-ip/
// SOLVE THIS!!!
const generateSSLCertificate = async (domain) => {
    try{
        const domainFolderPath = path.join(__dirname, '..', 'storage', 'domains', domain);
        const certFilePath = path.join(domainFolderPath, 'certificate.pem');
        const privateKeyFilePath = path.join(domainFolderPath, 'private-key.pem');

        const [certExists, privateKeyExists] = await Promise.all([
            fs.access(certFilePath).then(() => true).catch(() => false),
            fs.access(privateKeyFilePath).then(() => true).catch(() => false)
        ]);

        if(certExists && privateKeyExists){
            const [key, cert] = await Promise.all([
                fs.readFile(privateKeyFilePath, 'utf8'),
                fs.readFile(certFilePath, 'utf8')
            ]);
            return [key, cert];
        }

        const [key, cert] = await letssl.getCertificate({ 
            commonName: domain,
            builtInServerPort: 53565,
            storageDirPath: './storage/domains/' + domain
        });
        return [key, cert];
    }catch(error){
        console.log('[Quantum Cloud] CRITICAL ERROR (at @utilities/generateSSLCertificate):', error);
    }
};

module.exports = generateSSLCertificate;