/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import fs from 'fs';
import path from 'path';
import util from 'util';
import { ensureDirectoryExists } from '@utilities/runtime';
import { Socket } from 'socket.io';

const stat = util.promisify(fs.stat);
const truncate = util.promisify(fs.truncate);

/**
 * Manages logs for a user's containers.
 *
 * Responsibilities:
 * - Creates log directories as needed.
 * - Manages log file writes.
 * - Handles log rotation for size control.
 * - Provides access to the container's log.
 */
class ContainerLoggable{
    private logDir: string;
    private logFile: string;
    private userId: string;
    private logStream: fs.WriteStream;

    /**
     * Creates a new ContainerLoggable instance.
     *
     * @param logName - Name for the log file (without extension).
     * @param userId  - Unique identifier for the user.
     */
    constructor(logName: string, userId: string){
        this.logDir = path.join('/var/lib/quantum', process.env.NODE_ENV as string, 'containers', userId.toString(), 'logs');
        this.userId = userId;
        this.logFile = path.join(this.logDir, `${logName}.log`);
        this.init();
    }

    /**
     * Initializes the logger, creating the log stream if needed.
     * If a previous log stream exists for this user, it's closed.
     * 
     * @returns The log stream.
     */
    async init(){
        this.logStream = await this.createLogStream();
    }

    /**
     * Sets up socket events to handle streaming logs to the client.
     *
     * @param socket - The socket to emit events on.
     * @param shell - A shell interface to the container.  
     */
    async setupSocketEvents(socket: Socket, shell: any){
        socket.emit('history', await this.getLog());
        socket.on('command', (command: string) => {
            command = command + '\n';
            this.appendLog(command);
            shell.write(command);
        });
        shell.on('data', (chunk: Buffer) => {
            const data = chunk.toString('utf8');
            this.appendLog(data);
            socket.emit('response', data);
        });
    }

    /**
     * Initializes the logger, creating the log stream if needed.
     * If a previous log stream exists for this user, it's closed.
     */
    async createLogStream(): Promise<fs.WriteStream>{
        try{
            if((global as any).logStreamStore[this.userId]){
                (global as any).logStreamStore[this.userId].end();
                delete (global as any).logStreamStore[this.userId];
            }
            await ensureDirectoryExists(this.logDir);
            const stream = fs.createWriteStream(this.logFile, { flags: 'a' });
            (global as any).logStreamStore[this.userId] = stream;
            return stream;
        }catch(error){
            this.criticalErrorHandler('createLogStream', error);
        }
    }

    /**
     * Appends data to the container's log file.
     * Handles log rotation if needed and initializes the log stream
     * if not already initialized.
     * @param data - The data to append to the log.
     */
    async appendLog(data: string){
        await this.checkLogFileStatus();
        this.logStream.write(data);
    }

    /**
     * Checks if the log file exceeds the maximum allowed size.
     * If so, truncates the file.
     */
    async checkLogFileStatus(){
        try{
            const stats = await stat(this.logFile);
            const maxSize = Number(process.env.LOG_PATH_MAX_SIZE) * 1024;
            if(stats.size > maxSize) await truncate(this.logFile, 0);
        }catch(error){
            this.criticalErrorHandler('checkLogFileStatus', error);
        }
    }

    /**
     * Retrieves the contents of the container's log file.
     * @returns The log contents, or an empty string if the file doesn't exist.
     */
    async getLog(): Promise<string>{
        try{
            if(!fs.existsSync(this.logFile)) return '';
            const content = await fs.promises.readFile(this.logFile);
            return content.toString();
        }catch(error){
            console.error('[Quantum Cloud] (at @services/userContainer - getLog):', error);
            return '';
        }
    }

    /**
     * Removes non-printable characters from the log output.
     * @param data - The raw log data.
     * @returns The cleaned log data.
     */
    cleanOutput(data: string): string{
        return data.toString('utf8').replace(/[^ -~\n\r]+/g, '');
    }

    criticalErrorHandler(operation: string, error: any){
        console.error(`[Quantum Cloud] CRITICAL ERROR (at @services/containerLoggable - ${operation}):`, error);
        throw error;
    }
}

export default ContainerLoggable;