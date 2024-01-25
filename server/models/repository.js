const mongoose = require('mongoose');
const TextSearch = require('mongoose-partial-search');
const Github = require('@utilities/github');
const PTYHandler = require('@utilities/ptyHandler');
const Deployment = require('@models/deployment');
const User = require('@models/user');

const RepositorySchema = new mongoose.Schema({
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
RepositorySchema.index({ name: 1, user: 1 }, { unique: true });
RepositorySchema.index({ name: 'text' });

RepositorySchema.post('findOneAndDelete', async function(deletedDoc){
    const repositoryUser = await User
        .findByIdAndUpdate(deletedDoc.user, { 
            $pull: { repositories: deletedDoc._id } 
        })
        .populate('github');
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
    const { buildCommand, installCommand, startCommand } = context._update;
    const { _id } = context._conditions;
    const buildCommandLength = buildCommand.trim().length;
    const installCommandLength = installCommand.trim().length;
    const startCommandLength = startCommand.trim().length;
    if(buildCommandLength || installCommandLength || startCommandLength){
        const { user, name } = await Repository
            .findById(_id)
            .select('user name')
            .populate({ path: 'user', select: 'username' });

        const document = { ...{ user, name }, ...context._update };
        const ptyHandler = new PTYHandler(_id, document);
        ptyHandler.startRepository();
    }
};

const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;