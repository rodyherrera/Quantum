import mongoose, { Schema } from 'mongoose';

const DockerContainerSchema = new Schema({
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
    ports: {
        type: Map,
        of: Number,
        default: {}
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
    name: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

DockerContainerSchema.index({ user: 1, name: 1 }, { unique: true });

const DockerContainer = mongoose.model('DockerContainer', DockerContainerSchema);

export default DockerContainer;