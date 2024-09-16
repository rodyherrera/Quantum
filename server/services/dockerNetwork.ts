import logger from '@utilities/logger';
import Dockerode from 'dockerode';

class DockerNetwork{
    public docker: Dockerode = new Dockerode();
    private userId: string;
    
    constructor(userId: string){
        this.userId = userId;
    }

    async create(name: string, driver: string){
        try{
            const networkName = `${process.env.DOCKERS_NETWORK_ALISES}-${this.userId}-${name}`;
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
}

export default DockerNetwork;