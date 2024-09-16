import logger from '@utilities/logger';
import Dockerode, { Network } from 'dockerode';

class DockerNetwork{
    public docker: Dockerode = new Dockerode();
    private userId: string;
    
    constructor(userId: string){
        this.userId = userId;
    }

    getNetworkName(name: string): string{
        const { DOCKERS_NETWORK_ALIASES } = process.env;
        return `${DOCKERS_NETWORK_ALIASES}-${this.userId}-${name}`;
    }

    async create(name: string, driver: string): Promise<void>{
        try{
            const networkName = this.getNetworkName(name);
            await this.docker.createNetwork({
                Name: networkName,
                Driver: driver,
                CheckDuplicate: true,
                Attachable: true
            });
        }catch(error){
            logger.error('Error when trying to create docker network: ' + error);
        }
    }

    async remove(name: string): Promise<void>{
        try{
            const networkName = this.getNetworkName(name);
            const network = new Network(this.docker.modem, networkName);
            await network.remove();
        }catch(error){
            logger.error('Error when trying to delete docker network: ' + error);
        }
    }
}

export default DockerNetwork;