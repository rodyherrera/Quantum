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

import os from 'os';
import { Request, Response } from 'express';
import { catchAsync } from '@utilities/helpers';

/**
 * Calculates a single measurement of CPU usage statistics.
 * 
 * @returns {Object} An object containing 'idle' and 'total' CPU usage metrics. 
*/
const getCPUUsageSnapshot = (): { idle: number, total: number } => {
    let totalIdle = 0;
    let totalTick = 0;
    const cpus = os.cpus();
    for(let i = 0; i < cpus.length; i++){
        const cpu = cpus[i];
        for(const type in cpu.times){
            totalTick += (cpu.times as any)[type];
        }
        totalIdle += cpu.times.idle;
    }
    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
};

/**
 * Endpoint to retrieve the server's health status.
 * 
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
*/
export const health = catchAsync(async (req: Request, res: Response) => {
    const startMeasure = getCPUUsageSnapshot();

    setTimeout(() => {
        const endMeasure = getCPUUsageSnapshot();
  
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;
  
        const percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
        const ramUsage = (1 - os.freemem() / os.totalmem()) * 100;
  
        const serverStatus = (percentageCPU > 80 || ramUsage > 80) ? 'Server::Health::Overloaded' : 'Server::Health::Healthy';
        const ramStatus = (ramUsage > 80) ? 'Server::Health::RAM::Overloaded' : 'Server::Health::RAM::Healthy';
        const cpuStatus = (percentageCPU > 80) ? 'Server::Health::CPU::Overloaded' : 'Server::Health::CPU::Healthy';
  
        res.status(200).json({
            status: 'success',
            data: { serverStatus, cpuStatus, ramStatus }
        });
        // Delay for a more representative CPU usage calculation 
    }, 100); 
});

export const getServerIP = catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        data: process.env.SERVER_IP
    })
});