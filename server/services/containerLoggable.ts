import fs from 'fs';
import path from 'path';
import util from 'util';
import { ensureDirectoryExists } from '@utilities/runtime';
import { Socket } from 'socket.io';
import { Duplex } from 'stream';
import { Exec } from 'dockerode';

const stat = util.promisify(fs.stat);
const truncate = util.promisify(fs.truncate);

const logs: Map<string, fs.WriteStream> = new Map();
const sockets: Map<string, Socket> = new Map();
const shells: Map<string, Duplex> = new Map();

const getLogDir = (id: string): string => {
    return path.join('/var/lib/quantum', process.env.NODE_ENV as string, 'containers', id, 'logs');
};

const getLogFile = (logName: string, id: string): string => {
    const logDir = getLogDir(id);
    const logFile = path.join(logDir, `${logName}.log`);
    return logFile;
}

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

const removeLogStream = (id: string): void => {
    const stream = logs.get(id);
    if(stream){
        stream.end();
        logs.delete(id);
    }
};

export const setupSocketEvents = async (socket: Socket, logName: string, id: string, exec: Exec): Promise<void> => {
    try{
        const logHistory = await getLog(logName, id);
        let shell = shells.get(id);
        if(!shell){
            shell = await exec.start({ hijack: true, stdin: true });
            shells.set(id, shell);
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

const handleDisconnect = (id: string, socket: Socket, shell: Duplex | undefined, dataHandler: (chunk: Buffer) => void): void => {
    socket.disconnect(true);
    shell?.off('data', dataHandler);
    sockets.delete(id);
    removeLogStream(id);
}

export const appendLog = async (logName: string, id: string, data: string): Promise<void> => {
    await checkLogFileStatus(logName, id);
    const stream = logs.get(id);
    if(!stream) return;
    stream.write(data);
}

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

const getLog = async (logName: string, id: string): Promise<string> => {
    try{
        const logFile = getLogFile(logName, id);
        if(!fs.existsSync(logFile)) return '';
        const content = await fs.promises.readFile(logFile, 'utf-8');
        return content;
    }catch(error){
        console.error('[Quantum Cloud] (at @services/containerLoggable - getLog):', error);
        return '';
    }
}

const criticalErrorHandler = (operation: string, error: any): void => {
    console.error(`[Quantum Cloud] CRITICAL ERROR (at @services/containerLoggable - ${operation}):`, error);
    throw error;
}