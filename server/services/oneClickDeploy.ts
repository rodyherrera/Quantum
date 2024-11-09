import DockerContainer from '@models/docker/container';
import { IUser } from '@typings/models/user';
import { v4 } from 'uuid';
import { isImageAvailable } from '@services/docker/image';
import { IDockerContainer } from '@typings/models/docker/container';
import { IOneClickDeployConfig } from '@typings/services/oneClickDeploy';
import { IRequestDockerImage } from '@typings/controllers/docker/container';
import { IDockerImage } from '@typings/models/docker/image';
import { findRandomAvailablePort } from '@utilities/helpers';
import RuntimeError from '@utilities/runtimeError';
import DockerImage from '@models/docker/image';
import DockerNetwork from '@models/docker/network';
import PortBinding from '@models/portBinding';

const getDockerOrCreateDockerImage = async (image: IRequestDockerImage, userId: string): Promise<IDockerImage> => {
    const { name, tag } = image;
    if(!isImageAvailable(name, tag)){
        throw new RuntimeError('OneClickDeploy::Image::NotFound', 400);
    }
    const query = { user: userId, name, tag };
    const dockerImage = await DockerImage.findOne(query);
    if(!dockerImage){
        return await DockerImage.create(query)
    }
    return dockerImage;
};

const parseEnvironVariables = async (
    parent: any,
    husbands: Map<string, IDockerContainer>, 
    config: IOneClickDeployConfig
): Promise<any> => {
    if(!config.environment) return {};
    const variables: { [key: string]: string } = {};
    for(let [key, value] of Object.entries(config.environment)){
        if(value.startsWith('husbands:')){
            const husbandName = value.split('husbands:')[1];
            const husband = husbands.get(husbandName);
            if(!husband?.ipAddress) continue;
            value = husband.ipAddress;
        }
        variables[key] = value;
    }
    return await DockerContainer.findOneAndUpdate({ _id: parent.container._id }, { environment: { variables } });
};

const createParentContainer = async (user: IUser, config: IOneClickDeployConfig): Promise<any> => {
    const randAlias = v4().slice(0, 4);
    const containerName = `${config.name}-${randAlias}`;
    const networkName = `${containerName}-network`;
    const image = await getDockerOrCreateDockerImage(config.image as IRequestDockerImage, user._id);
    const network = await DockerNetwork.create({ name: networkName, user: user._id });
    const container = await DockerContainer.create({
        user: user._id,
        image: image._id,
        network: network._id,
        name: containerName,
        command: config.command,
    });
    for(const port of config.ports ?? []){
        const { internalPort, protocol } = port;
        const externalPort = await findRandomAvailablePort();
        await PortBinding.create({
            container: container._id,
            user: user._id,
            internalPort,
            protocol,
            externalPort
        });
    }
    return { network, container };
};

const createHusbandContainer = async (user: IUser, config: IOneClickDeployConfig, parentContainer: IDockerContainer) => {
    const randAlias = v4().slice(0, 4);
    const image = await getDockerOrCreateDockerImage(config.image as IRequestDockerImage, user._id);
    const containerName = `${config.name}-${randAlias}`;
    const husband = await DockerContainer.create({
        user: user._id,
        image: image._id,
        network: parentContainer.network._id,
        name: containerName,
        command: config.command,
        environment: { variables: config.environment }
    }); 
    return husband;
};

export const parseConfigAndDeploy = async (user: IUser, config: IOneClickDeployConfig): Promise<any> => {
    const parent = await createParentContainer(user, config);
    const husbands = new Map<string, IDockerContainer>();
    for(const husbandEntity of config.husbands ?? []){
        const container = await createHusbandContainer(user, husbandEntity, parent);
        husbands.set(husbandEntity.name, container);
    }
    return await parseEnvironVariables(parent, husbands, config);
};