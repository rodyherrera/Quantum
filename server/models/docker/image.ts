import mongoose, { Schema, Model } from 'mongoose';
import { getImageSize, pullImage } from '@services/docker/image';
import { IDockerImage } from '@typings/models/docker/image';

const DockerImageSchema: Schema<IDockerImage> = new Schema({
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

DockerImageSchema.index({ name: 1, tag: 1, user: 1 }, { unique: true });

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

const DockerImage: Model<IDockerImage> = mongoose.model('DockerImage', DockerImageSchema);

export default DockerImage;