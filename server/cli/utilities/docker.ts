import Docker from 'dockerode';
const docker = new Docker();

const aliases = ['quantum-container', 'quantum-network'];

export const filterAvailableContainers = async (activeOnly: boolean = false): Promise<any[]> => {
    const containers = await docker.listContainers({ all: !activeOnly });
    return containers
        .filter((containerInfo) => {
            if(!activeOnly || containerInfo.State === 'running'){
                const containerName = containerInfo.Names[0];
                return aliases.some((alias) => containerName.startsWith(`/${alias}`));
            }
            return false;
        });
};

export const filterAvailableNetworks = async (): Promise<any[]> => {
    const networks = await docker.listNetworks();
    return networks.filter((networkInfo) => {
        return aliases.some((alias) => networkInfo.Name.startsWith(alias));
    });
}