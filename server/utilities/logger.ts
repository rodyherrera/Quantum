import pino from 'pino';
import pretty from 'pino-pretty';

const logger = pino({
    level: process.env.LOG_LEVEL || 'info'
}, pretty());

export default logger;