const { filterAvailableContainers } = require('@cli/utilities/docker');

const listCreatedContainers = async () => {
    const availableContainers = await filterAvailableContainers();
    availableContainers.forEach((container) => {
        console.log('->', container.Names[0]);
    });
};

module.exports = listCreatedContainers;