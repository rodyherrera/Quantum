import mongoose, { Schema } from 'mongoose';

const DockerImageSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Image::Name::Required']
    },
    tag: {
        type: String,
        default: 'latest'
    },
    size: {
        type: Number
    },
    containers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DockerContainer'
    }]
}, {
    timestamps: true
});

const DockerImage = mongoose.model('DockerImage', DockerImageSchema);

export default DockerImage;