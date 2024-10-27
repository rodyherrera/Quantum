import logger from '@utilities/logger';
import Dockerode from 'dockerode';

const docker = new Dockerode();

export const isImageAvailable = async (imageName: string, tag: string = 'latest'): Promise<boolean> => {
    const fullImageName = `${imageName}:${tag}`;
    const image = docker.getImage(fullImageName);
    try{
        await image.inspect();
        return true;
    }catch(error: any){
        if(error.statusCode === 404){
            return false;
        }
        logger.error('@services/docker/image.ts (isImageAvailable): ' + error);
        throw error;
    }
}

export const getImageSize = async (imageName: string, tag: string) => {
    const fullImageName = `${imageName}:${tag}`;
    const image = docker.getImage(fullImageName);
    const details = await image.inspect();
    return details.Size;
}

export const pullImage = async (imageName: string, tag: string = 'latest'): Promise<void> => {
    try{
        const fullImageName = `${imageName}:${tag}`;
        const isAvailable = await isImageAvailable(imageName, tag);
        if(isAvailable) return;

        logger.info(`@services/docker/image.ts (pullImage): Pulling "${fullImageName}"...`);
        await new Promise<void>((resolve, reject) => {
            docker.pull(fullImageName, (error: any, stream: NodeJS.ReadableStream) => {
                if(error){
                    reject(error);
                    return;
                }
                docker.modem.followProgress(stream, (progressError) => {
                    if(progressError) reject(progressError);
                    else resolve();
                });
            });
        });

        logger.info(`@services/docker/image.ts (pullImage): Image "${fullImageName}" downloaded.`);
    }catch(error){
        logger.error('@services/docker/image.ts (pullImage): ' + error);
    }
}