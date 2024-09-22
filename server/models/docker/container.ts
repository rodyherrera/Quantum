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
    portBindings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PortBindings'
    }],
    name: {
        type: String,
        required: [true, 'DockerContainer::Name::Required']
    }
}, {
    timestamps: true
});

DockerContainerSchema.index({ user: 1, name: 1 }, { unique: true });

DockerContainerSchema.pre('save', async function(next){
    const containerId = this._id.toString();
    const userId = this.user.toString();
    const { containerStoragePath, userContainerPath } = getContainerStoragePath(userId, containerId, userId);
    this.dockerContainerName = getSystemDockerName(this.name);
    this.storagePath = this.isUserContainer ? userContainerPath : containerStoragePath;
    const containerService = new DockerContainerService(this);
    if(this.isNew){
        await containerService.createAndStartContainer();
        //console.log('is new', await containerService.getIpAddress());
    }
    next();
});

const DockerContainer: Model<IDockerContainer> = mongoose.model('DockerContainer', DockerContainerSchema);

export default DockerContainer;