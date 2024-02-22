const { filterAvailableContainers } = require('@cli/utilities/docker');

const listActiveContainers = async () => {
    const activeContainers = await filterAvailableContainers(true);
    activeContainers.forEach((container) => {
        console.log('->', container.Names[0]);
    });
};

module.exports = listActiveContainers;