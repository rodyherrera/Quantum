const mongoose = require('mongoose');

const DockerInstanceSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'DockerInstance::User::Required']
    },
    name: {
        type: String,
        required: [true, 'DockerInstance::Name::Required']
    },
    image: {
        type: String,
        required: [true, 'DockerInstance::Image::Required']
    },
    status: {
        type: String,
        enum: ['created', 'running', 'stopped'],
        default: 'created'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    startedAt: { type: Date },
    stoppedAt: { type: Date },
    environmentVariables: [{
        name: String,
        value: String
    }]
    // ports [{ ... }]
});

const DockerInstance = mongoose.model('DockerInstance', DockerInstanceSchema);

module.exports = DockerInstance;