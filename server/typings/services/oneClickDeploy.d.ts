import { IDockerContainerVolume } from '@typings/models/docker/container';

export interface IOneClickDeployConfig{
    name: string;
    husbands?: IOneClickDeployConfig[];
    ports?: [{
        protocol: string,
        internalPort: number
    }],
    command?: string,
    image: {
        name: string,
        tag: string
    },
    volumes: IDockerContainerVolume[];
    environment?: {
        [key: string]: string
    }
}