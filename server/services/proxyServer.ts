import logger from '@utilities/logger';
import http, { IncomingMessage, ServerResponse } from 'http';
import httpProxy from 'http-proxy';
import dgram, { Socket } from 'dgram';

const proxy = httpProxy.createProxyServer({});
const servers = new Map<string, http.Server | Socket>();
const udpClients = new Map<string, Socket>();

export const startProxyServer = (
    containerIp: string,
    externalPort: number, 
    internalPort: number, 
    protocol: string
) => {
    const serverId = `${containerIp}:${internalPort}/${protocol}->${externalPort}`;
    logger.info(`@services/proxyServer - ${serverId}`);
    if(servers.has(serverId)){
        return;
    }

    if(protocol === 'tcp'){
        const tcpServer = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            proxy.web(req, res, { target: `http://${containerIp}:${internalPort}` }, (err) => {
                logger.error(`TCP Server Error: ${err}`)
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`<h3>TCP Proxy Error</h3><br><p>${serverId}</p><i>QuantumCloud/1.0.7</i>`);
            });
        });
        tcpServer.listen(externalPort, '0.0.0.0', () => {
            logger.debug(`TCP proxy listening on ${externalPort}`);
        }); 
        servers.set(serverId, tcpServer);
    }else if(protocol === 'udp'){
        const udpServer = dgram.createSocket('udp4');
        udpServer.on('error', (err) => {
            logger.error(`UDP Server error:\n${err.stack}`);
            udpServer.close();
        });
        udpServer.on('message', (message, rinfo) => {
            const clientId = `${rinfo.address}:${rinfo.port}`;
            let client = udpClients.get(clientId);
            if(!client){
                client = dgram.createSocket('udp4');
                udpClients.set(clientId, client);
                client.on('message', (response) => {
                    udpServer.send(response, rinfo.port, rinfo.address, (err) => {
                        if(err){
                            logger.error(`Error sending response back to client: ${err}`);
                        }
                    });
                });
                client.on('error', (err) => {
                    logger.error(`UDP Client error: ${err}`);
                    if(client) client.close();
                    udpClients.delete(clientId);
                });
            }
            client.send(message, internalPort, containerIp, (err) => {
                if(err){
                    logger.error(`Error sending message to internal service: ${err}`);
                }
            });
        });

        udpServer.on('listening', () => {
            const address = udpServer.address();
            logger.debug(`UDP proxy listening on ${address.address}:${address.port}`);
        });

        udpServer.bind(externalPort, '0.0.0.0');
        servers.set(serverId, udpServer);
    }
}