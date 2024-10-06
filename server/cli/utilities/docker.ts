import Docker from 'dockerode';
const docker = new Docker();

const aliases = ['quantum-container', 'quantum-network'];

export const filterAvailableContainers = async (activeOnly: boolean = false): Promise<any[]> => {
    const containers = await docker.listContainers({ all: !activeOnly });
    return containers
        .filter((containerInfo) => {
            const containerName = containerInfo.Names[0];
            return aliases.some((alias) => containerName
                .startsWith(`/${alias}`)) && (!activeOnly || containerInfo.State === 'running');
        });
};

export const filterAvailableNetworks = async (): Promise<any[]> => {
    const networks = await docker.listNetworks();
    return networks.filter((networkInfo) => aliases.some((alias) => networkInfo.Name.startsWith(alias)));
};

export const removeContainers = async (containers: any[]): Promise<void> => {
    for(const container of containers){
        try{
            const cont = docker.getContainer(container.Id);
            const containerDetails = await cont.inspect();
            if(containerDetails.State.Running){
                await cont.stop();
                console.log(`Stopped container: ${container.Names[0]}`);
            }
            await cont.remove({ force: true });
            console.log(`Deleted container: ${container.Names[0]}`);
        }catch(error){
            console.error(`Error for container ${container.Names[0]}:`, error);
        }
    }
};

export const removeNetworks = async (networks: any[]): Promise<void> => {
    for(const network of networks){
        try{
            const net = docker.getNetwork(network.Id);
            const networkDetails = await net.inspect();
            const containers = networkDetails.Containers;
            if(containers){
                for(const containerId in containers){
                    try{
                        await net.disconnect({ Container: containerId, Force: true });
                        console.log(`Container ${containerId} disconnected from network ${network.Name}`);
                    }catch (error){
                        console.error(`Error disconnecting container ${containerId}:`, error);
                    }
                }
            }
            await net.remove();
            console.log(`Deleted: ${network.Name}`);
        }catch(error){
            console.error(`Error for ${network.Name}:`, error);
        }
    }
};
