import pino from 'pino';
import pretty from 'pino-pretty';

const logger = pino({
    level: 
}, pretty());

export default logger;