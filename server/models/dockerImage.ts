import mongoose, { Schema } from 'mongoose';
import { getImageSize, pullImage } from '@services/dockerImage';

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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    containers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DockerContainer'
    }]
}, {
    timestamps: true
});

DockerImageSchema.pre('save', async function(next){
    if(!this.isNew){
        next();
        return;
    }
    // Pull image if not exists
    await pullImage(this.name, this.tag);
    this.size = await getImageSize(this.name, this.tag);
    next();
});

const DockerImage = mongoose.model('DockerImage', DockerImageSchema);

export default DockerImage;