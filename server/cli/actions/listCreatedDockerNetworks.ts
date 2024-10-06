import { filterAvailableNetworks } from '@cli/utilities/docker';

const listCreatedDockerNetworks = async () => {
    const dockerNetworks = await filterAvailableNetworks();
    console.log(dockerNetworks)
    dockerNetworks.forEach((network) => {
        console.log('->', network.Name);
    });
};

export default listCreatedDockerNetworks;