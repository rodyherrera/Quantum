const fs = require('fs');
const readline = require('readline');
const util = require('util');
const { exec } = require('child_process');
const execAsync = util.promisify(exec);

// Configuration
const NGINX_PATH = '/etc/nginx';
const NGINX_FILE = NGINX_PATH + '/sites-enabled/default';

/**
 * Reads the current contents of the Nginx configuration file.
 * @returns {string} The Nginx configuration content.
*/
const getCurrentConfig = () => {
    return fs.readFileSync(NGINX_FILE, 'utf-8');
};

/**
 * Removes all Quantum Blocks from the Nginx configuration file.
*/
exports.removeDomains = () => {
    const rl = readline.createInterface({ input: fs.createReadStream(NGINX_FILE) });
    let newConfig = '';
    let inQuantumBlock = false;
    rl.on('line', (line) => {
        if(line.startsWith('# Start-Quantum-Block-')){
            inQuantumBlock = true;
        }else if(line.startsWith('# End-Quantum-Block-')){
            inQuantumBlock = false;
        }else if(!inQuantumBlock){
            newConfig += line + '\n';
        }
    });
    rl.on('close', async () => {
        fs.writeFileSync(NGINX_FILE, newConfig);
        // Reload NGINX for changes to take effect
        await reloadNginx();
    });
};

/**
 * Removes a specific domain's configuration block from the Nginx file.
 * @param {string} domain The domain name to remove.
*/
exports.removeDomain = async (domain) => {
    const currentConfig = getCurrentConfig();
    const startPattern = `# Start-Quantum-Block-${domain}\n`;
    const endPattern = `# End-Quantum-Block-${domain}\n`;
    const startIndex = currentConfig.indexOf(startPattern);
    const endIndex = currentConfig.indexOf(endPattern, startIndex) + endPattern.length;
    if(startIndex === -1 || endIndex === -1){
        console.error(`[Quantum Cloud]: Domain '${domain}' not found in NGINX configuration.`);
        return;
    }
    const updatedConfig = currentConfig.substring(0, startIndex) + currentConfig.substring(endIndex);
    fs.writeFileSync(NGINX_FILE, updatedConfig);
    await reloadNginx();
};

/**
 * Updates a domain's configuration in the Nginx file (removes old, adds new).
 * @param {Object} domainConfig An object containing domain configuration properties:
 *   - domain: The domain name.
 *   - ipv4: The IPv4 address.
 *   - port: The port number.
*/
exports.updateDomain = async (domainConfig) => {
    await this.removeDomain(domainConfig.domain);
    await this.addDomain(domainConfig);
};

/**
 * Adds a new domain configuration block to the Nginx file.
 * @param {Object} domainConfig An object containing domain configuration properties:
 *   - domain: The domain name.
 *   - ipv4: The IPv4 address.
 *   - port: The port number.
*/
exports.addDomain = async (domainConfig) => {
    const { domain, ipv4, port } = domainConfig;
    let sslTemplate = ''; 
    if(domainConfig){
        sslTemplate = `
server{
    server_name ${domain};

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://${ipv4}:${port};
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem; 
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; 
}`;
    }
    const template = `
# Start-Quantum-Block-${domain}
server{
    server_name ${domain};

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://${ipv4}:${port};
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

${sslTemplate}

server {
    if ($host = ${domain}) {
        return 301 https://$host$request_uri;
    } 

	server_name ${domain};
    listen 80;
    return 404; 
}
# End-Quantum-Block-${domain}
`;
    fs.appendFileSync(NGINX_FILE, template);
    await reloadNginx();
};

/**
 * Reloads the Nginx configuration.
*/
const reloadNginx = async () => {
    await execAsync('sudo nginx -s reload');
};

exports.generateSSLCert = async (domain, email) => {
    const command = `certbot certonly --webroot -w ${__dirname}/../public -d ${domain} --agree-tos --email ${email} --non-interactive`;
    try{
        await execAsync(command);
        console.log(`[Quantum Cloud]: SSL certificate generated successfully for ${domain}`);
        await reloadNginx();
    }catch(error){
        console.error(`[Quantum Cloud]: Error generating SSL certificate: ${error}`);
        // Re-throw to propagate the error
        throw error;
    }
};

module.exports = exports;