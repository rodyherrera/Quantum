const os = require('os');
const { catchAsync } = require('@utilities/runtime');

const cpuAverage = () => {
    let totalIdle = 0;
    let totalTick = 0;
    const cpus = os.cpus();
    // Loop through CPU cores
    for(let i = 0, len = cpus.length; i < len; i++){
        const cpu = cpus[i];
        // Total up the time in the cores tick
        for(type in cpu.times){
            totalTick += cpu.times[type];
        }
        // Total up the idle time of the core
        totalIdle += cpu.times.idle;
    }
    // Return the average idle and tick times
    return {
        idle: totalIdle / cpus.length,
        total: totalTick / cpus.length
    };
};

exports.health = catchAsync(async (req, res) => {
    // Grab first CPU Measure
    const startMeasure = cpuAverage();

    // Set delay for second Measure
    setTimeout(function() { 
        // Grab second Measure
        const endMeasure = cpuAverage(); 

        // Calculate the difference in idle and total time between the measures
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;

        // Calculate the average percentage CPU usage
        const percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

        const ramUsage = (1 - os.freemem() / os.totalmem()) * 100;

        console.log(percentageCPU);
    
        const serverStatus = (percentageCPU > 80 || ramUsage > 80) 
            ? 'Server::Health::Overloaded' 
            : 'Server::Health::Healthy';
    
        const ramStatus = (ramUsage > 80) 
            ? 'Server::Health::RAM::Overloaded'
            : 'Server::Health::RAM::Healthy';
        
        const cpuStatus = (percentageCPU > 80)
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
    }, 100);
});