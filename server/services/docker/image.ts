import logger from '@utilities/logger';
import Dockerode from 'dockerode';

const docker = new Dockerode();

export const isImageAvailable = async (imageName: string, tag: string = 'latest'): Promise<boolean> => {
    const fullImageName = `${imageName}:${tag}`;
    try{
        const images = await docker.listImages({ filters: fullImageName });
        return images.some((image) => image.RepoTags?.includes(fullImageName));
    }catch(error: any){
        logger.error('@services/docker/image.ts (isImageAvailable): ' + error);
        throw error;
    }
}

export const getImageSize = async (imageName: string, tag: string) => {
    const fullImageName = `${imageName}:${tag}`;
    try{
        const image = docker.getImage(fullImageName);
        const details = await image.inspect();
        return details.Size;
    }catch(error: any){
        logger.error(`@services/docker/image.ts (getImageSize): ${error.message}`);
        throw error;
    }
}

export const pullImage = async (imageName: string, tag: string = 'latest'): Promise<void> => {
    const fullImageName = `${imageName}:${tag}`;
    try{
        const isAvailable = await isImageAvailable(imageName, tag);
        if(isAvailable) return;

        logger.info(`@services/docker/image.ts (pullImage): Pulling "${fullImageName}"...`);
        const stream = await docker.pull(fullImageName);
        await new Promise<void>((resolve, reject) => {
            docker.modem.followProgress(stream, (err: any) => (err ? reject(err) : resolve()));
        });
        logger.info(`@services/docker/image.ts (pullImage): Image "${fullImageName}" downloaded.`);
    }catch(error: any){
        logger.error('@services/docker/image.ts (pullImage): ' + error);
        throw error;
    }
}