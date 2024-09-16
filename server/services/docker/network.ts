import logger from '@utilities/logger';
import Dockerode, { Network } from 'dockerode';

const docker = new Dockerode();

const getNetworkName = (userId: string, name: string): string => {
    const { DOCKERS_NETWORK_ALIASES } = process.env;
    return `${DOCKERS_NETWORK_ALIASES}-${userId}-${name}`;
}

export const createNetwork = async (userId: string, name: string, driver: string): Promise<void> => {
    try{
        const networkName = getNetworkName(userId, name);
        await docker.createNetwork({
            Name: networkName,
            Driver: driver,
            CheckDuplicate: true,
            Attachable: true
        });
    }catch(error){
        logger.error('Error when trying to create docker network: ' + error);
    }
}


export const removeNetwork = async (userId: string, name: string): Promise<void> => {
    try{
        const networkName = getNetworkName(userId, name);
        const network = new Network(docker.modem, networkName);
        await network.remove();
    }catch(error){
        logger.error('Error when trying to delete docker network: ' + error);
    }
}