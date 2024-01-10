const mongoose = require('mongoose');
const TextSearch = require('mongoose-partial-search');
const Github = require('@utilities/github');
const PTYHandler = require('@utilities/ptyHandler');

const RepositorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Repository::Name::Required']
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

RepositorySchema.post('findOneAndDelete', async function(doc){
    const Deployment = this.model('Deployment');
    await Deployment.deleteMany({ repository: doc._id });
    await Repository.model('User').findByIdAndUpdate(doc.user, { $pull: { repositories: doc._id } });
    Github.deleteLogAndDirectory(`${__dirname}/../storage/pty-log/${doc._id}.log`, `${__dirname}/../storage/repositories/${doc._id}/`);
});

RepositorySchema.pre('findOneAndUpdate', async function(next){
    try{
        const { buildCommand, installCommand, startCommand } = this._update;
        const { _id } = this._conditions;
        const buildCommandLength = buildCommand.trim().length;
        const installCommandLength = installCommand.trim().length;
        const startCommandLength = startCommand.trim().length;
        if(buildCommandLength && installCommandLength && startCommandLength){
            const { user, name } = await (await Repository.findById(_id).select('user name')).populate({
                path: 'user', select: 'username' });
            const document = { ...{ user, name }, ...this._update };
            new PTYHandler(_id, document).startRepository();
        }
        next();
    }catch(error){
        next(error);
    }
});

RepositorySchema.pre('save', async function(next){
    try{
        const user = await this.model('User').findById(this.user).populate('github');
        const github = new Github(user, this);
        const deployment = await github.deployRepository();
        this.deployments.push(deployment._id);
        await this.model('User').findByIdAndUpdate(this.user, { 
            $push: { repositories: this._id, deployments: deployment._id } 
        });
        next();
    }catch(error){
        return next(error);
    }
});

const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;