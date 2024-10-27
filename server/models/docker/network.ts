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
    await removeNetwork(document.dockerNetworkName);
    // TODO: Allow a container to function without having an assigned network.
    await mongoose.model('DockerContainer').deleteMany({ network: document._id });
    await mongoose.model('User').updateOne({ _id: document.user }, { $pull: { networks: document._id } });
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

DockerNetworkSchema.post('findOneAndDelete', async function(doc){
    await cascadeDeleteHandler(doc);
});

DockerNetworkSchema.pre('deleteMany', async function(){
    const conditions = this.getQuery();
    const networks = await mongoose.model('DockerNetwork').find(conditions);
    await Promise.all(networks.map(async (network) => {
        await cascadeDeleteHandler(network);
    }));
});

const DockerNetwork: Model<IDockerNetwork> = mongoose.model('DockerNetwork', DockerNetworkSchema);

export default DockerNetwork;