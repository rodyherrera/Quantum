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

DockerNetworkSchema.pre('save', async function(next){
    try{
        if(this.isNew){
            this.subnet = randomIPv4Subnet();
            const userId = (this.user as IUser)._id.toString();
            this.dockerNetworkName = getSystemNetworkName(userId, this._id.toString());
            const updateUser = { $push: { dockerNetworks: this._id } };
            await createNetwork(this.dockerNetworkName, this.driver, this.subnet);
            await mongoose.model('User').updateOne({ _id: this.user }, updateUser);
        }
        next();
    }catch(error: any){
        next(error);
    }
});

DockerNetworkSchema.post('findOneAndDelete', async function(doc){
    await removeNetwork(doc.dockerNetworkName);
});

DockerNetworkSchema.pre('deleteMany', async function(){
    const conditions = this.getQuery();
    const networks = await mongoose.model('DockerNetwork').find(conditions);
    await Promise.all(networks.map(async (network) => {
        await removeNetwork(network.dockerNetworkName);
    }));
});

const DockerNetwork: Model<IDockerNetwork> = mongoose.model('DockerNetwork', DockerNetworkSchema);

export default DockerNetwork;