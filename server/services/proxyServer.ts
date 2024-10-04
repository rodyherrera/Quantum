import WebSocket from 'ws';
import logger from '@utilities/logger';

export const createProxyServer = (
    external_port: number,
    ip_address: string,
    internal_port: number
) => {
    const ws = new WebSocket('ws://0.0.0.0:10000');
    ws.on('open', () => {
        logger.info(`@services/proxyServer.ts - creating for ${ip_address}:${internal_port}->${external_port}...`);
        const proxyMessage = {
            event: 'createReverseProxy',
            data: { internal_port, external_port, ip_address }
        };
        ws.send(JSON.stringify(proxyMessage), (err: any) => {
            if(err){
                logger.error(`Error creating reverse proxy (${ip_address}:${internal_port}->${external_port}): ` + err);
                return;
            }
            logger.info(`Created reverse proxy for (${ip_address}:${internal_port}->${external_port})`);
        });
    });
}