import mongoose, { Schema } from 'mongoose';

const DockerContainerSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'DockerContainer::User::Required']
    },
    image: {
        type: String,
        required: [true, 'DockerContainer::Image::Required']
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
    volumeMounts: {
        type: [String],
        default: []
    },
    networks: {
        type: [String],
        default: []
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