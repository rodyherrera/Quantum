import fs from 'fs';
import path from 'path';
import util from 'util';
import logger from '@utilities/logger';
import { ensureDirectoryExists } from '@utilities/helpers';
import { Socket } from 'socket.io';
import { Duplex } from 'stream';
import { Exec } from 'dockerode';

const stat = util.promisify(fs.stat);
const truncate = util.promisify(fs.truncate);

/** Map to store active log write streams */
export const logs: Map<string, fs.WriteStream> = new Map();
/** Map to store active socket connections */
export const sockets: Map<string, Socket> = new Map();
/** Map to store active shell connections */
export const shells: Map<string, Duplex> = new Map();

/**
 * Generates the log directory path for a given container ID
 * @param id - The container ID
 * @returns The full path to the log directory
*/
const getLogDir = (id: string): string => {
    return path.join('/var/lib/quantum', process.env.NODE_ENV as string, 'containers', id, 'logs');
};

/**
 * Generates the full path for a log file
 * @param logName - The name of the log file
 * @param id - The container ID
 * @returns The full path to the log file
*/
const getLogFile = async (logName: string, logDir: string): Promise<string> => {
    await ensureDirectoryExists(logDir);
    const logFile = path.join(logDir, `${logName}.log`);
}

/**
 * Creates a new log stream for a given container
 * @param logName - The name of the log file
 * @param id - The container ID
 * @returns A Promise that resolves to the created WriteStream, or null if an error occurs
*/
export const createLogStream = async (userId: string, logId: string): Promise<fs.WriteStream | null> => {
    try{
        removeLogStream(logId);
        const logDir = getLogDir(userId);
        const logFile = await getLogFile(logId, logDir);
        const stream = fs.createWriteStream(logFile, { flags: 'a' });
        logs.set(logId, stream);
        return stream;
    }catch(error: any){
        criticalErrorHandler('createLogStream', error);
        return null;
    }
}

/**
 * Removes an existing log stream for a given container
 * @param id - The container ID
*/
const removeLogStream = (logId: string): void => {
    const stream = logs.get(logId);
    if(stream){
        stream.end();
        logs.delete(logId);
    }
};

/**
 * Sets up socket events for a container
 * @param socket - The socket instance
 * @param logName - The name of the log file
 * @param id - The container ID
 * @param exec - The Dockerode exec instance
*/
export const setupSocketEvents = async (socket: Socket, userId: string, logId: string, exec: Exec): Promise<void> => {
    try{
        const logHistory = await getLog(userId, logId);
        let shell = shells.get(logId);
        if(!shell){
            shell = await exec.start({ Tty: true, stdin: true, hijack: true });
            shells.set(logId, shell);
        }
        const handleShellData = (chunk: Buffer) => {
            const data = chunk.toString('utf8');
            appendLog(userId, logId, data);
            socket.emit('response', data);
        };
        sockets.set(logId, socket);
        socket.on('disconnect', () => handleDisconnect(logId, socket, shell, handleShellData));
        socket.emit('history', logHistory);
        socket.on('command', (command: string) => {
            shell?.write(`${command}\n`);
        });
        shell.on('data', handleShellData);
    }catch(error){
        criticalErrorHandler('setupSocketEvents', error);
    }
}

const handleDisconnect = (id: string, socket: Socket, shell: Duplex | undefined, dataHandler: (chunk: Buffer) => void): void => {
    socket.disconnect(true);
    shell?.off('data', dataHandler);
    sockets.delete(id);
    removeLogStream(id);
}

export const appendLog = async (userId: string, id: string, data: string): Promise<void> => {
    await checkLogFileStatus(userId, id);
    const stream = logs.get(id);
    if(!stream) return;
    stream.write(data);
}

const checkLogFileStatus = async (userId: string, logId: string): Promise<void> => {
    try{
        const logDir = getLogDir(userId);
        const logFile = await getLogFile(logId, logDir);
        const stats = await stat(logFile);
        const maxSize = Number(process.env.LOG_PATH_MAX_SIZE) * 1024;
        if(stats.size > maxSize){
            await truncate(logFile, 0);
        }
    }catch(error: any){
        criticalErrorHandler('checkLogFileStatus', error);
    }
}

const getLog = async (userId: string, logId: string): Promise<string> => {
    try{
        const logDir = getLogDir(userId);
        const logFile = await getLogFile(logId, logDir);
        if(!fs.existsSync(logFile)) return '';
        const content = await fs.promises.readFile(logFile, 'utf-8');
        return content;
    }catch(error){
        logger.error('@services/logManager.ts (getLog): ' + error);
        return '';
    }
}

const criticalErrorHandler = (operation: string, error: any): void => {
    logger.error(`@services/logManager.ts (${operation}): ` + error);
    throw error;
}