import logger from '@utilities/logger';
import Dockerode, { Image } from 'dockerode';

const docker = new Dockerode();

// duplicated code @services/dockerHandler.ts
export const isImageAvailable = async (imageName: string): Promise<boolean> => {
    const image = docker.getImage(imageName);
    try{
        await image.inspect();
        return true;
    }catch(error: any){
        if(error.statusCode === 404){
            return false;
        }
        logger.error('@services/dockerImage - isImageAvailable: ' + error);
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
        const isAvailable = await isImageAvailable(fullImageName);
        if(isAvailable) return;

        logger.info(`Pulling "${fullImageName}"...`);
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

        logger.info(`Image "${fullImageName}" downloaded.`);
    }catch(error){
        logger.error('CRITICAL ERROR (@dockerHandler - pullImage):', error);
    }
}