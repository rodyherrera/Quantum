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

const fs = require('fs');
const path = require('path');
const util = require('util');
const stat = util.promisify(fs.stat);
const truncate = util.promisify(fs.truncate);

class ContainerLoggable{
    constructor(logName, userId){
        this.logDir = path.join(__dirname, '..', 'storage', 'containers', userId.toString(), 'logs');
        this.userId = userId;
        this.logFile = path.join(this.logDir, `${logName}.log`);
        this.init();
    };

    async init(){
        this.logStream = await this.createLogStream();
    };

    async createLogStream(){
        try{
            if(global.logStreamStore[this.userId]){
                global.logStreamStore[this.userId].end();
                delete global.logStreamStore[this.userId];
            }
            await this.ensureDirectoryExists(this.logDir);
            const stream = fs.createWriteStream(this.logFile, { flags: 'a' });
            global.logStreamStore[this.userId] = stream;
            return stream;
        }catch(error){
            this.criticalErrorHandler('createLogStream', error);
        }
    };

    async appendLog(data){
        await this.checkLogFileStatus();
        this.logStream.write(data);
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
            await fs.promises.access(directoryPath);
        }catch(error){
            if(error.code === 'ENOENT'){
                await fs.promises.mkdir(directoryPath, { recursive: true });
            }else{
                throw error;
            }
        }
    };

    async getLog(){
        try{
            if(!fs.existsSync(this.logFile)) return '';
            const content = await fs.promises.readFile(this.logFile);
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