import logger from '@utilities/logger';
import Dockerode, { Network } from 'dockerode';

const docker = new Dockerode();

export const getSystemNetworkName = (userId: string, name: string): string => {
    const { DOCKERS_NETWORK_ALIASES } = process.env;
    return `${DOCKERS_NETWORK_ALIASES}-${userId}-${name}`;
}

export const randomIPv4Subnet = (): string => {
    const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const octet1 = getRandomInt(10, 192);
    const octet2 = getRandomInt(0, 255);
    const octet3 = getRandomInt(0, 255);
    return `${octet1}.${octet2}.${octet3}.0/24`;
}

export const createNetwork = async (userId: string, name: string, driver: string, subnet: string): Promise<void> => {
    try{
        const networkName = getSystemNetworkName(userId, name);
        await docker.createNetwork({
            Name: networkName,
            Driver: driver,
            CheckDuplicate: true,
            Attachable: true,
            IPAM: {
                Config: [{ Subnet: subnet }]
            }
        });
    }catch(error){
        logger.error('Error when trying to create docker network: ' + error);
    }
}

export const removeNetwork = async (userId: string, name: string): Promise<void> => {
    try{
        const networkName = getSystemNetworkName(userId, name);
        const network = new Network(docker.modem, networkName);
        await network.remove();
    }catch(error){
        logger.error('Error when trying to delete docker network: ' + error);
    }
}