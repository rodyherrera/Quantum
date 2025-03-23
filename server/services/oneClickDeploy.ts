import DockerContainer from '@models/docker/container';
import { IUser } from '@typings/models/user';
import { v4 } from 'uuid';
import { pullImage } from '@services/docker/image';
import { IDockerContainer } from '@typings/models/docker/container';
import { IOneClickDeployConfig } from '@typings/services/oneClickDeploy';
import { IRequestDockerImage } from '@typings/controllers/docker/container';
import { IDockerImage } from '@typings/models/docker/image';
import { findRandomAvailablePort } from '@utilities/helpers';
import DockerImage from '@models/docker/image';
import DockerNetwork from '@models/docker/network';
import PortBinding from '@models/portBinding';

const getDockerOrCreateDockerImage = async (image: IRequestDockerImage, userId: string): Promise<IDockerImage> => {
    const { name, tag } = image;
    await pullImage(name, tag);
    const query = { user: userId, name, tag };
    const dockerImage = await DockerImage.findOne(query);
    if(!dockerImage){
        return await DockerImage.create(query)
    }
    return dockerImage;
};

const createContainerWithBindings = async (
    user: IUser,
    config: IOneClickDeployConfig, 
    imageId: string, 
    networkId: string
): Promise<IDockerContainer> => {
    const randAlias = v4().slice(0, 4);
    const containerName = `${config.name}-${randAlias}`;
    const container = await DockerContainer.create({
        user: user._id,
        image: imageId,
        network: networkId,
        name: containerName,
        command: config.command,
        volumes: config.volumes,
        environment: { variables: config.environment }
    });

    if(config.ports && config.ports.length > 0){
        await Promise.all(config.ports.map(async (port) => {
            const { internalPort, protocol } = port;
            const externalPort = await findRandomAvailablePort();
            return PortBinding.create({
                container: container._id,
                user: user._id,
                internalPort,
                protocol,
                externalPort
            });
        }));
    }
    return container;
};

const parseEnvironVariables = async (
    parent: any,
    husbands: Map<string, IDockerContainer>, 
    config: IOneClickDeployConfig
): Promise<any> => {
    if (!config.environment) return {};

    const variables: { [key: string]: string } = {};
    const envEntries = Object.entries(config.environment);

    const husbandPortRegex = /\$\{([^}]+)\}/g;
    const literalPortRegex = /:(\d+)/g;

    for(let [key, value] of envEntries){
        value = value.replace('{server_ip}', process.env.SERVER_IP || 'localhost');
        let match;
        while ((match = husbandPortRegex.exec(value)) !== null) {
            // match[0] e.g. "${n8n-DB.externalPort}"
            // match[1] e.g. "n8n-DB.externalPort"
            const placeholder = match[0];
            const reference = match[1]; 
            
            const [husbandName, property] = reference.split('.');
            if(property !== 'externalPort'){
                throw new Error(`Unknown property in reference: ${reference}`);
            }

            const husband = husbands.get(husbandName);
            if(!husband){
                throw new Error(`Husband "${husbandName}" not found.`);
            }
            const portBinding = await PortBinding
                .findOne({ container: husband._id })
                .select('externalPort')
                .lean();

            if(!portBinding){
                throw new Error(`PortBinding for "${husbandName}" not found`);
            }

            value = value.replace(placeholder, portBinding.externalPort.toString());
        }

        let portMatch;
        while ((portMatch = literalPortRegex.exec(value)) !== null){
            // portMatch[0] = ":80", portMatch[1] = "80"
            const fullMatch = portMatch[0];
            const internalPort = parseInt(portMatch[1], 10); 

            const portBinding = await PortBinding.findOne({
                container: parent.container._id,
                internalPort
            }).select('externalPort').lean();

            if(portBinding?.externalPort){
                value = value.replace(fullMatch, `:${portBinding.externalPort}`);
            }
        }

        variables[key] = value;
    }

    return await DockerContainer.findOneAndUpdate(
        { _id: parent.container._id },
        { environment: { variables } },
        { new: true }
    );
};


const createParentContainer = async (user: IUser, config: IOneClickDeployConfig): Promise<any> => {
    const [image, network] = await Promise.all([
        getDockerOrCreateDockerImage(config.image as IRequestDockerImage, user._id),
        DockerNetwork.create({
            name: `${config.name}-${v4().slice(0, 4)}-network`,
            user: user._id
        })
    ]);

    const container = await createContainerWithBindings(user, config, image._id.toString(), network._id.toString());
    return { network, container };
};

const createHusbandsContainer = async (user: IUser, husbandsConfig: IOneClickDeployConfig[], parentContainer: IDockerContainer) => {
    const husbandsMap = new Map<string, IDockerContainer>();
    const containers = await Promise.all(husbandsConfig.map(async (config) => {
        const image = await getDockerOrCreateDockerImage(config.image as IRequestDockerImage, user._id);
        const container = await createContainerWithBindings(user, config, image._id.toString(), parentContainer.network.toString());
        return { name: config.name, container };
    }));

    containers.forEach(({ name, container }) => husbandsMap.set(name, container));
    return husbandsMap;
};

export const parseConfigAndDeploy = async (user: IUser, config: IOneClickDeployConfig): Promise<any> => {
    const parent = await createParentContainer(user, config);
    const husbands = await createHusbandsContainer(user, config.husbands ?? [], parent.container);
    return parseEnvironVariables(parent, husbands, config);
};