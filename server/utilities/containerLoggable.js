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

const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const stat = util.promisify(fs.stat);
const truncate = util.promisify(fs.truncate);
const { createWriteStream, existsSync, exists } = require('fs');

class ContainerLoggable{
    constructor(logDir, userId){
        this.logDir = logDir;
        this.userId = userId;
        this.logFile = path.join(this.logDir, `${userId}.log`);
        this.logStream = this.createLogStream();
    };

    async createLogStream(){
        try{
            if(global.logStreamStore[this.userId]){
                global.logStreamStore[this.userId].end();
                delete global.logStreamStore[this.userId];
            }
            await this.ensureDirectoryExists(this.logDir);
            const stream = createWriteStream(this.logFile);
            global.logStreamStore[this.userId] = stream;
            return stream;
        }catch(error){
            this.criticalErrorHandler('createLogStream', error);
        }
    };

    async appendLog(data){
        await this.checkLogFileStatus();
        const stream = await this.logStream;
        stream.write(data);
    };

    async checkLogFileStatus(){
        try{
            const stats = await stat(this.logFile);
            const maxSize = process.env.LOG_PATH_MAX_SIZE * 1024;
            if(stats.size > maxSize) await truncate(this.logFile, 0);
        }catch(error){
            this.criticalErrorHandler('checkLogFileStatus', error);
        }
    };

    async ensureDirectoryExists(directoryPath){
        try{
            await fs.access(directoryPath);
        }catch(error){
            if(error.code === 'ENOENT'){
                await fs.mkdir(directoryPath, { recursive: true });
            }else{
                throw error;
            }
        }
    };

    async getLog(){
        try{
            if(!existsSync(this.logFile)) return '';
            const content = await fs.readFile(this.logFile);
            return content.toString();
        }catch(error){
            console.error('[Quantum Cloud] (at @utilities/userContainer - getLog):', error);
            return '';
        };
    };

    cleanOutput(data){
        return data.toString('utf8').replace(/[^ -~\n\r]+/g, '');
    };

    criticalErrorHandler(operation, error){
        console.error(`[Quantum Cloud] CRITICAL ERROR (at @utilities/containerLoggable - ${operation}):`, error);
        throw error;
    }
};

module.exports = ContainerLoggable;