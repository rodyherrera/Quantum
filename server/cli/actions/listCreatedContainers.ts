import { filterAvailableContainers } from '@cli/utilities/docker';

const listCreatedContainers = async () => {
    const availableContainers = await filterAvailableContainers();
    availableContainers.forEach((container) => {
        console.log('->', container.Names[0]);
    });
};

export default listCreatedContainers;