const os = require('os');
const { catchAsync } = require('@utilities/runtime');

const getCPULoad = () => {
    const cpus = os.cpus();
    const numCPUs = cpus.length;
    let totalLoad = 0;
    for(const cpu of cpus){
        const cpuLoad = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle;
        totalLoad += cpuLoad;
    }
    const avgLoad = totalLoad / numCPUs;
    const percentLoad = 100 - (100 * (avgLoad - os.cpus()[0].times.idle) / avgLoad);
    return percentLoad.toFixed(2);
};

exports.health = catchAsync(async (req, res) => {
    const cpuUsage = getCPULoad();
    const ramUsage = (1 - os.freemem() / os.totalmem()) * 100;

    const serverStatus = (cpuUsage > 80 || ramUsage > 80) 
        ? 'Server::Health::Overloaded' 
        : 'Server::Health::Healthy';

    const ramStatus = (ramUsage > 80) 
        ? 'Server::Health::RAM::Overloaded'
        : 'Server::Health::RAM::Healthy';
    
    const cpuStatus = (cpuUsage > 80)
        ? 'Server::Health::CPU::Overloaded'
        : 'Server::Health::CPU::Healthy'

    res.status(200).json({
        status: 'success',
        data: {
            serverStatus,
            cpuStatus,
            ramStatus
        }
    });
});