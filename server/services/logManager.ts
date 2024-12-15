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
const getLogFile = (logName: string, id: string): string => {
    const logDir = getLogDir(id);
    const logFile = path.join(logDir, `${logName}.log`);
    return logFile;
}

/**
 * Creates a new log stream for a given container
 * @param logName - The name of the log file
 * @param id - The container ID
 * @returns A Promise that resolves to the created WriteStream, or null if an error occurs
*/
export const createLogStream = async (logName: string, id: string): Promise<fs.WriteStream | null> => {
    try{
        removeLogStream(id);
        const logDir = getLogDir(id);
        await ensureDirectoryExists(logDir);
        const logFile = getLogFile(logName, id);
        const stream = fs.createWriteStream(logFile, { flags: 'a' });
        logs.set(id, stream);
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
const removeLogStream = (id: string): void => {
    const stream = logs.get(id);
    if(stream){
        stream.end();
        logs.delete(id);
    }
};

/**
 * Sets up socket events for a container
 * @param socket - The socket instance
 * @param logName - The name of the log file
 * @param id - The container ID
 * @param exec - The Dockerode exec instance
*/
export const setupSocketEvents = async (socket: Socket, logName: string, id: string, exec: Exec): Promise<void> => {
    try{
        const logHistory = await getLog(logName, id);
        let shell = shells.get(id);
        if(!shell){
            // TODO: Very ugly solution to a simple error. FIX.
            try{
                shell = await exec.start({ Tty: true, stdin: true, hijack: true });
                shells.set(id, shell);
            }catch(error){
                shell = exec;
                shells.set(logName, exec);
            }
        }
        const handleShellData = (chunk: Buffer) => {
            const data = chunk.toString('utf8');
            appendLog(logName, id, data);
            socket.emit('response', data);
        };
        sockets.set(socket.id, socket);
        socket.on('disconnect', () => handleDisconnect(id, socket, shell, handleShellData));
        socket.emit('history', logHistory);
        socket.on('command', (command: string) => {
            shell?.write(`${command}\n`);
        });
        shell.on('data', handleShellData);
    }catch(error){
        criticalErrorHandler('setupSocketEvents', error);
    }
}

/**
 * Handles the disconnection of a socket
 * @param id - The container ID
 * @param socket - The socket instance
 * @param shell - The shell instance
 * @param dataHandler - The data handler function
*/
const handleDisconnect = (id: string, socket: Socket, shell: Duplex | undefined, dataHandler: (chunk: Buffer) => void): void => {
    socket.disconnect(true);
    shell?.off('data', dataHandler);
    sockets.delete(id);
    removeLogStream(id);
}

/**
 * Appends data to a log file
 * @param logName - The name of the log file
 * @param id - The container ID
 * @param data - The data to append
*/
export const appendLog = async (logName: string, id: string, data: string): Promise<void> => {
    await checkLogFileStatus(logName, id);
    const stream = logs.get(id);
    if(!stream) return;
    stream.write(data);
}

/**
 * Checks the status of a log file and truncates it if it exceeds the maximum size
 * @param logName - The name of the log file
 * @param id - The container ID
*/
const checkLogFileStatus = async (logName: string, id: string): Promise<void> => {
    try{
        const logFile = getLogFile(logName, id);
        const stats = await stat(logFile);
        const maxSize = Number(process.env.LOG_PATH_MAX_SIZE) * 1024;
        if(stats.size > maxSize){
            await truncate(logFile, 0);
        }
    }catch(error: any){
        criticalErrorHandler('checkLogFileStatus', error);
    }
}

/**
 * Retrieves the content of a log file
 * @param logName - The name of the log file
 * @param id - The container ID
 * @returns A Promise that resolves to the content of the log file
*/
const getLog = async (logName: string, id: string): Promise<string> => {
    try{
        const logFile = getLogFile(logName, id);
        if(!fs.existsSync(logFile)) return '';
        const content = await fs.promises.readFile(logFile, 'utf-8');
        return content;
    }catch(error){
        logger.error('@services/logManager.ts (getLog): ' + error);
        return '';
    }
}

/**
 * Handles critical errors by logging them and throwing the error
 * @param operation - The name of the operation where the error occurred
 * @param error - The error object
*/
const criticalErrorHandler = (operation: string, error: any): void => {
    logger.error(`@services/logManager.ts (${operation}): ` + error);
    throw error;
}