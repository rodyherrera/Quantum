import mongoose, { Schema } from 'mongoose';

const DockerNetworkSchema = new Schema({
    name: {
        type: String,
        required: [true, 'DockerNetwork::Name::Required'],
        unique: true,
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

const DockerNetwork = mongoose.model('DockerNetwork', DockerNetworkSchema);

export default DockerNetwork;