import mongoose, { Schema, Model } from 'mongoose';
import { getImageSize, pullImage } from '@services/docker/image';
import { IDockerImage } from '@typings/models/docker/image';
import RuntimeError from '@utilities/runtimeError';

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

const cascadeDeleteHandler = async (document: IDockerImage): Promise<void> => {
    if(!document) return;
    const { _id } = document;
    await mongoose.model('DockerContainer').deleteMany({ image: _id });
    await mongoose.model('User').updateOne({ user: document.user }, { $pull: { images: _id } })
};

const hasActiveMainContainers = async (document: IDockerImage): Promise<boolean> => {
    const containers = await mongoose.model('DockerContainer').find({ image: document._id, isUserContainer: true });
    const hasActiveMainContainers = containers.length >= 1;
    return hasActiveMainContainers;
};

DockerImageSchema.pre('deleteMany', async function(next){
    const conditions = this.getQuery();
    const images = await mongoose.model('DockerImage').find(conditions);
    await Promise.all(images.map(async (image) => {
        if(await hasActiveMainContainers(image)){
            next(new RuntimeError('Docker::Image::ActiveUserContainers', 403));
            return;
        }
        await cascadeDeleteHandler(image);
    }));
    next();
});

DockerImageSchema.pre('findOneAndDelete', async function(next){
    const image = await this.model.findOne(this.getQuery());
    if(await hasActiveMainContainers(image)){
        next(new RuntimeError('Docker::Image::ActiveUserContainers', 403));
        return;
    }
    next();
});

DockerImageSchema.post('findOneAndDelete', async function(deletedDoc){
    await cascadeDeleteHandler(deletedDoc);
});

DockerImageSchema.pre('save', async function(next){
    try{
        if(this.isNew){
            // Pull image if not exists
            await pullImage(this.name, this.tag);
            this.size = await getImageSize(this.name, this.tag);
            const updateUser = { $push: { images: this._id } };
            await mongoose.model('User').updateOne({ _id: this.user }, updateUser);
        }
        next();
    }catch(error: any){
        next(error);   
    }
});

const DockerImage: Model<IDockerImage> = mongoose.model('DockerImage', DockerImageSchema);

export default DockerImage;