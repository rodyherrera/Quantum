import mongoose, { Schema, Model } from 'mongoose';
import { IDockerNetwork } from '@typings/models/docker/network';
import { createNetwork, removeNetwork, randomIPv4Subnet, getSystemNetworkName } from '@services/docker/network';
import { IUser } from '@typings/models/user';

const DockerNetworkSchema: Schema<IDockerNetwork> = new Schema({
    name: {
        type: String,
        required: [true, 'DockerNetwork::Name::Required'],
        unique: true,
    },
    dockerNetworkName: {
        type: String
    },
    subnet: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'DockerNetwork::User::Required']
    },
    driver: {
        type: String,
        // By default it is bridge and, from the frontend, you cannot choose what 
        // type of network. This is because the overlay is with docker swarm. And, 
        // Quantum still does not allow connections between multiple servers. Still.
        enum: ['bridge', 'overlay', 'none'],
        default: 'bridge',
        required: [true, 'DockerNetwork::Driver::Required']
    },
    containers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DockerContainer'
    }]
}, {
    timestamps: true
});

DockerNetworkSchema.index({ user: 1, name: 1 }, { unique: true });

const cascadeDeleteHandler = async (document: IDockerNetwork): Promise<void> => {
    if(!document) return;
    // TODO: Allow a container to function without having an assigned network.
    await mongoose.model('DockerContainer').deleteMany({ network: document._id });
    await mongoose.model('User').updateOne({ _id: document.user }, { $pull: { networks: document._id } });
    await removeNetwork(document.dockerNetworkName);
};

DockerNetworkSchema.pre('save', async function(next){
    try{
        if(this.isNew){
            this.subnet = randomIPv4Subnet();
            const userId = (this.user as IUser)._id.toString();
            this.dockerNetworkName = getSystemNetworkName(userId, this._id.toString());
            await createNetwork(this.dockerNetworkName, this.driver, this.subnet);
            await mongoose.model('User').updateOne({ _id: this.user }, { $push: { networks: this._id } });
        }
        next();
    }catch(error: any){
        next(error);
    }
});

const hasActiveMainContainers = async (document: IDockerNetwork): Promise<boolean> => {
    const containers = await mongoose.model('DockerContainer').find({ 
        network: document._id, 
        isUserContainer: true 
    });
    const hasActiveMainContainers = containers.length >= 1;
    return hasActiveMainContainers;
};

DockerNetworkSchema.pre('findOneAndDelete', async function(next){
    const network = await this.model.findOne(this.getQuery());
    if(await hasActiveMainContainers(network)){
        next(new Error('Docker::Network::ActiveUserContainers'));
        return;
    }
    next();
});

DockerNetworkSchema.post('findOneAndDelete', async function(doc){
    await cascadeDeleteHandler(doc);
});

DockerNetworkSchema.pre('deleteMany', async function(next){
    const conditions = this.getQuery();
    const networks = await mongoose.model('DockerNetwork').find(conditions);
    await Promise.all(networks.map(async (network) => {
        if(await hasActiveMainContainers(network)){
            next(new Error('Docker::Network::ActiveUserContainers'));
            return;
        }
        await cascadeDeleteHandler(network);
    }));
    next();
});

const DockerNetwork: Model<IDockerNetwork> = mongoose.model('DockerNetwork', DockerNetworkSchema);

export default DockerNetwork;