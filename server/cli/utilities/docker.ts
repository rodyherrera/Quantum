import Docker from 'dockerode';
const docker = new Docker();

export const filterAvailableContainers = async (activeOnly: boolean = false): Promise<any[]> => {
    const containers = await docker.listContainers({ all: !activeOnly });
    if(process.env.DOCKERS_CONTAINER_ALIASES){
        const aliases = process.env.DOCKERS_CONTAINER_ALIASES.split(',');
        return containers
            .filter((containerInfo) => {
                if(!activeOnly || containerInfo.State === 'running'){
                    const containerName = containerInfo.Names[0];
                    return aliases.some((alias) => containerName.startsWith(`/${alias}`));
                }
                return false;
            });
    }
    return activeOnly ? containers.filter((containerInfo) => containerInfo.State === 'running') : containers;
};