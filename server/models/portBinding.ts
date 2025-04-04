import mongoose, { Schema, Model } from 'mongoose';
import { IPortBinding } from '@typings/models/portBinding';
import DockerContainer from '@models/docker/container';
import DockerContainerService from '@services/docker/container';

const PortBindingSchema: Schema<IPortBinding> = new Schema({
    container: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'PortBinding::Container::Required'],
        ref: 'DockerContainer'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'PortBinding::User::Required'],
        ref: 'User'
    },
    internalPort: {
        type: Number,
        required: true,
        min: 1,
        max: 65535
    },
    protocol: {
        type: String,
        enum: ['tcp', 'udp'],
        default: 'tcp'
    },
    externalPort: {
        type: Number,
        required: [true, 'PortBinding::ExternalPort::Required'],
        min: 1,
        max: 65535
    }
}, {
    timestamps: true
});

PortBindingSchema.index({ container: 1, externalPort: 1, internalPort: 1 }, { unique: true });

const cascadeDeleteHandler = async (document: IPortBinding, options: { [key: string]: string } | undefined = undefined ): Promise<void> => {
    if(!document) return;
    const update = { $pull: { portBindings: document._id } };
    await mongoose.model('User').updateOne({ _id: document.user }, update);
    if(options && options?.isContainerDeletion) return;
    const container = await mongoose.model('DockerContainer').findOneAndUpdate({ _id: document.container }, update);
    if(!container) return;
    const containerService = new DockerContainerService(container);
    await containerService.reloadContainer();
};

PortBindingSchema.post('findOneAndDelete', async function(deletedDoc: IPortBinding){
    await cascadeDeleteHandler(deletedDoc);
});

PortBindingSchema.pre('deleteMany', async function(){
    const conditions = this.getQuery();
    const options = this.getOptions();
    const portBindings = await mongoose.model('PortBinding').find(conditions);
    await Promise.all(portBindings.map(async (portBinding: IPortBinding) => {
        await cascadeDeleteHandler(portBinding, options);
    }));
});

PortBindingSchema.post('save', async function(){
    const container = await DockerContainer.findById(this.container);
    if(container?.ipAddress && this.externalPort){
        const containerService = new DockerContainerService(container);
        await containerService.reloadContainer();
    }
});

PortBindingSchema.pre('save', async function(next){
    try{
        if(this.isNew){
            const update = { $push: { portBindings: this._id } };
            await mongoose.model('User').updateOne({ _id: this.user }, update);
            await mongoose.model('DockerContainer').updateOne({ _id: this.container }, update);
        }
        next();
    }catch(error: any){
        next(error);
    }
});

const PortBinding: Model<IPortBinding> = mongoose.model('PortBinding', PortBindingSchema);

export default PortBinding;