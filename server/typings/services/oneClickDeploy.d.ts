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
    environment?: {
        [key: string]: string
    }
}