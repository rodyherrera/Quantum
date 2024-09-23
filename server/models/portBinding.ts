import mongoose, { Schema, Model } from 'mongoose';
import { IPortBinding } from '@typings/models/portBinding';
import { startProxyServer } from '@services/proxyServer';
import DockerContainer from '@models/docker/container';

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
        unique: true,
        min: 1,
        max: 65535
    }
}, {
    timestamps: true
});

PortBindingSchema.pre('save', async function(next){
    try{
        if(this.isNew){
            const updateUser = { $push: { portBindings: this._id } };
            await mongoose.model('User').updateOne({ _id: this.user }, updateUser);
            const container = await DockerContainer.findById(this.container).select('ipAddress');
            if(container?.ipAddress && this.externalPort){
                startProxyServer(container.ipAddress, this.externalPort, this.internalPort, this.protocol);
            }
        }
        next();
    }catch(error: any){
        next(error);
    }
});

const PortBinding: Model<IPortBinding> = mongoose.model('PortBinding', PortBindingSchema);

export default PortBinding;