const mongoose = require('mongoose');
const TextSearch = require('mongoose-partial-search');
const Github = require('@utilities/github');
const Deployment = require('@models/deployment');
const User = require('@models/user');
const { PTYHandler } = require('@utilities/ptyHandler');
const { v4 } = require('uuid');

const RepositorySchema = new mongoose.Schema({
    alias: {
        type: String,
        maxlength: [32, 'Repository::Alias::MaxLength'],
        minlength: [4, 'Repository::Alias::MinLength'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Repository::Name::Required']
    },
    webhookId: {
        type: String
    },
    buildCommand: {
        type: String,
        default: '',
    },
    installCommand: {
        type: String,
        default: '',
    },
    startCommand: {
        type: String,
        default: '',
    },
    rootDirectory: {
        type: String,
        default: '/',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Repository::User::Required'],
    },
    url: {
        type: String,
        required: [true, 'Repository::URL::Required'],
    },
    deployments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deployment',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

RepositorySchema.plugin(TextSearch);
RepositorySchema.index({ alias: 1, user: 1 }, { unique: true });
RepositorySchema.index({ name: 'text', alias: 'text' });

RepositorySchema.post('findOneAndDelete', async function(deletedDoc){
    const repositoryUser = await User
        .findByIdAndUpdate(deletedDoc.user, { 
            $pull: { repositories: deletedDoc._id } 
        })
        .populate('github');
    const deployments = await Deployment
        .find({ repository: deletedDoc._id })
        .select('githubDeploymentId');

    await Deployment.deleteMany({ repository: deletedDoc._id });

    const ptyHandler = new PTYHandler(deletedDoc._id, deletedDoc);
    ptyHandler.clearRuntimePTYLog();
    ptyHandler.removeFromRuntimeStoreAndKill();

    await Github.deleteLogAndDirectory(
        `${__dirname}/../storage/pty-log/${deletedDoc._id}.log`,
        `${__dirname}/../storage/repositories/${deletedDoc._id}/`
    );
    
    const github = new Github(repositoryUser, deletedDoc);
    await github.deleteWebhook();
    for(const deployment of deployments){
        const { githubDeploymentId } = deployment;
        await github.deleteRepositoryDeployment(githubDeploymentId);
    }
});

RepositorySchema.pre('findOneAndUpdate', async function(next){
    try{
        await handleUpdateCommands(this);
        next();
    }catch (error){
        next(error);
    }
});

RepositorySchema.pre('save', async function(next){
    try{
        if(!this.alias) this.alias = this.name;
        const repositoryByAlias = await this.model('Repository').findOne({ alias: this.alias, user: this.user });
        if(repositoryByAlias) this.alias = this.alias + '-' + v4().slice(0, 4);
        const repositoryUser = await this.model('User')
            .findById(this.user)
            .populate('github');
        const github = new Github(repositoryUser, this);
        const deployment = await github.deployRepository();
        const webhookEndpoint = `${process.env.DOMAIN}/api/v1/webhook/${this._id}/`;
        this.webhookId = await github.createWebhook(webhookEndpoint, process.env.SECRET_KEY)
        this.deployments.push(deployment._id);
        await this.model('User').findByIdAndUpdate(this.user, { 
            $push: { repositories: this._id, deployments: deployment._id } 
        });
        next();
    }catch(error){
        return next(error);
    }
});

const handleUpdateCommands = async (context) => {
    const { buildCommand, installCommand, startCommand, rootDirectory } = context._update;
    const { _id } = context._conditions;
    const rootDirectoryLength = rootDirectory.length;
    const buildCommandLength = buildCommand.length;
    const installCommandLength = installCommand.length;
    const startCommandLength = startCommand.length;
    if(buildCommandLength || installCommandLength || startCommandLength || rootDirectoryLength){
        const { user, name, deployments } = await Repository
            .findById(_id)
            .select('user name deployments')
            .populate({ path: 'user', select: 'username' });
        const document = { user, name, deployments, buildCommand, 
            installCommand, startCommand, rootDirectory };
        const ptyHandler = new PTYHandler(_id, document);
        ptyHandler.startRepository();
    }
};

const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;