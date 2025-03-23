import mongoose, { Schema, Model, UpdateQuery } from 'mongoose';
import { IDockerContainer } from '@typings/models/docker/container';
import DockerContainerService, { getContainerStoragePath, getSystemDockerName } from '@services/docker/container';
import { encrypt, decrypt } from '@utilities/encryption';
import logger from '@utilities/logger';

const DockerContainerSchema: Schema<IDockerContainer> = new Schema({
    isUserContainer: {
        type: Boolean,
        default: false
    },
    isRepositoryContainer: {
        type: Boolean,
        default: false
    },
    dockerContainerName: {
        type: String
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository'
    },
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
        enum: ['created', 'running', 'stopped', 'restarting'],
        default: 'created'
    },
    command: {
        type: String
    },
    startedAt: {
        type: Date,
    },
    volumes: [{
        containerPath: { type: String, required: true },
        mode: {
            type: String,
            enum: ['rw', 'ro'],
            default: 'rw'
        }
    }],
    stoppedAt: {
        type: Date
    },
    environment: {
        isEncrypted: {
            type: Boolean,
            default: false
        },
        variables: {
            type: Map,
            of: String,
            default: () => new Map()
        }
    },
    ipAddress: {
        type: String,
        default: ''
    },
    portBindings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PortBinding'
    }],
    // can't change later
    name: {
        type: String,
        required: [true, 'DockerContainer::Name::Required']
    }
}, {
    timestamps: true
});

DockerContainerSchema.index({ user: 1, name: 1 }, { unique: true });

const cascadeDeleteHandler = async (document: IDockerContainer): Promise<void> => {
    if(!document) return;
    const { user, network, image, _id } = document;
    const update = { $pull: { containers: _id } };
    await mongoose.model('User').updateOne({ _id: user }, update);
    if(document.isRepositoryContainer){
        await mongoose.model('DockerNetwork').deleteOne({ _id: network });
    }else{
        const dockerNetwork = await mongoose.model('DockerNetwork').findById(network).select('containers');
        if(dockerNetwork.containers.length === 1){
            await mongoose.model('DockerNetwork').deleteOne({ _id: network });
        }else{
            await mongoose.model('DockerNetwork').updateOne({ _id: network }, update);
        }
    }
    await mongoose.model('DockerImage').updateOne({ _id: image }, update);
    await mongoose.model('PortBinding').deleteMany({ container: _id }, { isContainerDeletion: true });
    const containerService = new DockerContainerService(document);
    await containerService.removeContainer();
};

DockerContainerSchema.pre('findOneAndDelete', async function (){
    const container = await this.model.findOne(this.getQuery());
    await cascadeDeleteHandler(container);
});

DockerContainerSchema.pre('deleteMany', async function(){
    const conditions = this.getQuery();
    const containers = await mongoose.model('DockerContainer').find(conditions);
    await Promise.all(containers.map(async (container: IDockerContainer) => {
        await cascadeDeleteHandler(container);
    }));
});

DockerContainerSchema.pre('findOneAndUpdate', async function (next){
    const update = this.getUpdate()
    if(!update){
        return next();
    }
    const modifiedPaths = Object.keys(update);

    if(modifiedPaths.includes('environment') || modifiedPaths.includes('command')){
        const doc = await this.model.findOne(this.getQuery());
        logger.info(`@models/docker/container.ts (findOneAndUpdate): Recreating container (${doc.dockerContainerName}) with new environment variables...`);
        if(!doc) return next();
        const typedUpdate = update as UpdateQuery<IDockerContainer>;
        if(typedUpdate.environment){
            Object.assign(doc.environment, typedUpdate.environment);
        }
        const containerService = new DockerContainerService(doc);
        await containerService.reloadContainer();
        logger.info(`@models/docker/container.ts (findOneAndUpdate): Recreated (${doc.dockerContainerName}).`);
    }

    // If we're updating environment variables, handle encryption
    if(modifiedPaths.includes('environment')){
        const typedUpdate = update as UpdateQuery<IDockerContainer>;
        if(typedUpdate.environment && typedUpdate.environment.variables){
            const doc = await this.model.findOne(this.getQuery());
            if(!doc) return next();
            
            const updatedVariables = typedUpdate.environment.variables;
            const encryptedVariables = new Map<string, string>();
            for(const [key, value] of Object.entries(updatedVariables)){
                encryptedVariables.set(key, encrypt(value));
            }

            typedUpdate.environment.variables = encryptedVariables;
            typedUpdate.environment.isEncrypted = true;
        }
    }
});

DockerContainerSchema.post('find', function(docs){
    if(!docs) return docs;
    for(const doc of docs){
        if(doc.environment && doc.environment.isEncrypted){
            const encryptedVars = new Map(doc.environment.variables);
            const decryptedVars = new Map<string, string>();
            for(const [key, value] of encryptedVars.entries()){
                decryptedVars.set(key, decrypt(value));
            }
            doc.environment.variables = decryptedVars;
        }
    }
    return docs;
});

DockerContainerSchema.post('findOne', function(doc){
    if(!doc || !doc.environment || !doc.environment.isEncrypted) return doc;
    const encryptedVars = new Map(doc.environment.variables);
    const decryptedVars = new Map<string, string>();
    for(const [key, value] of encryptedVars.entries()){
        decryptedVars.set(key, decrypt(value));
    }
    doc.environment.variables = decryptedVars;
    return doc;
});

DockerContainerSchema.pre('save', async function (next){
    try{
        if(this.isNew){
            const containerId = this._id.toString();
            const userId = this.user.toString();
            const paths = getContainerStoragePath(userId, containerId, userId);
            this.dockerContainerName = getSystemDockerName(containerId);
            if(this.isUserContainer){
                this.storagePath = paths.userContainerPath;
            }else if(this.isRepositoryContainer){
                this.storagePath = paths.repositoryContainerPath;
            }else{
                this.storagePath = paths.containerStoragePath;
            }
            const containerService = new DockerContainerService(this);
            await containerService.createAndStartContainer();
            const ipAddress = await containerService.getIpAddress();
            if(ipAddress){
                this.ipAddress = ipAddress;
            }
            const update = { $push: { containers: this._id } };
            await mongoose.model('User').updateOne({ _id: this.user }, update);
            await mongoose.model('DockerImage').updateOne({ _id: this.image }, update);
            // TODO: Implement logic to be able to deploy the container with 
            // a different network, that is, one that can be changed.
            await mongoose.model('DockerNetwork').updateOne({ _id: this.network }, update);
        }
        if(!this.environment.isEncrypted && this.environment.variables.size > 0){
            const encryptedVariables = new Map<string, string>();
            for(const [key, value] of this.environment.variables.entries()){
                encryptedVariables.set(key, encrypt(value));
            }
            this.environment.variables = encryptedVariables;
            this.environment.isEncrypted = true;
        }
        next();
    }catch(error: any){
        next(error);
    }
});

const DockerContainer: Model<IDockerContainer> = mongoose.model('DockerContainer', DockerContainerSchema);

export default DockerContainer;