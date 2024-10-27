import logger from '@utilities/logger';
import Dockerode, { Network } from 'dockerode';

const docker = new Dockerode();

export const getSystemNetworkName = (userId: string, name: string): string => {
    return `quantum-network-${process.env.NODE_ENV}-${userId}-${name}`;
}

export const randomIPv4Subnet = (): string => {
    const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const octet1 = getRandomInt(10, 192);
    const octet2 = getRandomInt(0, 255);
    const octet3 = getRandomInt(0, 255);
    return `${octet1}.${octet2}.${octet3}.0/24`;
}

export const createNetwork = async (networkName: string, driver: string, subnet: string): Promise<void> => {
    try{
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
        logger.error('@services/docker/network.ts (createNetwork): Error when trying to create docker network ' + error);
    }
}

export const removeNetwork = async (networkName: string): Promise<void> => {
    try{
        const network = new Network(docker.modem, networkName);
        await network.remove();
    }catch(error){
        logger.error('@services/docker/network.ts (removeNetwork): Error when trying to delete docker network ' + error);
    }
}