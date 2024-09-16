import mongoose, { Schema } from 'mongoose';
import DockerNetworkService from '@services/docker/network';

const DockerNetworkSchema = new Schema({
    name: {
        type: String,
        required: [true, 'DockerNetwork::Name::Required'],
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'DockerNetwork::User::Required']
    },
    driver: {
        type: String,
        enum: ['bridge', 'host', 'overlay', 'none'],
        default: 'bridge',
        required: [true, 'DockerNetwork::Bridge::Required']
    },
    containers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DockerContainer'
    }]
}, {
    timestamps: true
});

DockerNetworkSchema.pre('save', async function(next){
    if(!this.isNew){
        return next();
    }
    try{
        const userId = this.user.toString();
        const network = new DockerNetworkService(userId);
        await network.create(this.name, this.driver);
        next();
    }catch(error: any){
        next(error);
    }
});

DockerNetworkSchema.post('findOneAndDelete', async function(doc){
    console.log(doc);
    const userId = doc.user.toString();
    const network = new DockerNetworkService(userId);
    await network.remove(doc.name);
});

const DockerNetwork = mongoose.model('DockerNetwork', DockerNetworkSchema);

export default DockerNetwork;