import mongoose, { Schema, Model } from 'mongoose';
import { IDockerContainer } from '@typings/models/docker/container';
import DockerContainerService, { getContainerStoragePath, getSystemDockerName } from '@services/docker/container';

const DockerContainerSchema: Schema<IDockerContainer> = new Schema({
    isUserContainer: {
        type: Boolean,
        default: false
    },
    dockerContainerName: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'DockerContainer::User::Required']
    },
    network: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DockerNetwork',
        required: [true, 'DockerContainer::Network::Required']
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DockerImage',
        required: [true, 'DockerContainer::Image::Required'],
    },
    storagePath: {
        type: String
    },
    status: {
        type: String,
        enum: ['created', 'running', 'stopped', 'paused', 'exited'],
        default: 'created'
    },
    startedAt: {
        type: Date,
    },
    stoppedAt: {
        type: Date
    },
    environment: {
        type: Map,
        of: String,
        default: {}
    },
    ipAddress: {
        type: String,
        default: ''
    },
    portBindings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PortBindings'
    }],
    // can't change later
    name: {
        type: String,
        required: [true, 'DockerContainer::Name::Required']
    }
}, {
    timestamps: true
});

DockerContainerSchema.index({ user: 1, name: 1 }, { unique: true });

DockerContainerSchema.post('findOneAndDelete', async function(deletedDoc){
    const { user, network, image, _id } = deletedDoc;
    const update = { $pull: { containers: _id } };
    await mongoose.model('User').updateOne({ _id: user }, update);
    await mongoose.model('DockerNetwork').updateOne({ _id: network }, update);
    await mongoose.model('DockerImage').updateOne({ _id: image }, update);
    await mongoose.model('PortBinding').deleteOne({ container: _id });
});

DockerContainerSchema.pre('save', async function(next){
    try{
        if(this.isNew){
            const containerId = this._id.toString();
            const userId = this.user.toString();
            const { containerStoragePath, userContainerPath } = getContainerStoragePath(userId, containerId, userId);
            this.dockerContainerName = getSystemDockerName(this.name);
            this.storagePath = this.isUserContainer ? userContainerPath : containerStoragePath;
            const containerService = new DockerContainerService(this);
            await containerService.createAndStartContainer();
            const ipAddress = await containerService.getIpAddress();
            if(ipAddress){
                this.ipAddress = ipAddress;
            }
            // Should this be in the 'pre' middleware? What about the other models?
            const updateUser = { $push: { dockerContainers: this._id } };
            await mongoose.model('User').updateOne({ _id: this.user }, updateUser);
        }
        next();
    }catch(error: any){
        next(error);
    }
});

const DockerContainer: Model<IDockerContainer> = mongoose.model('DockerContainer', DockerContainerSchema);

export default DockerContainer;