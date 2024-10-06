import { filterAvailableNetworks } from '@cli/utilities/docker';

const listCreatedDockerNetworks = async () => {
    const dockerNetworks = await filterAvailableNetworks();
    dockerNetworks.forEach((network) => {
        console.log('->', network.Name);
    });
};

export default listCreatedDockerNetworks;