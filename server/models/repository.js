const mongoose = require('mongoose');
const TextSearch = require('mongoose-partial-search');
const { deployRepository, startRepository } = require('../utilities/github');

const RepositorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Repository::Name::Required'],
        unique: true,
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
RepositorySchema.index({ name: 'text' });

RepositorySchema.pre('remove', async function(){
    await this.model('Deployment').deleteMany({ repository: this._id });
    await this.model('User').findByIdAndUpdate(this.user, { $pull: { repositories: this._id } });
});

RepositorySchema.pre('save', async function(next){
    try{
        const user = await this.model('User').findById(this.user).populate('github');
        const deployment = await deployRepository(this, user);
        this.deployments.push(deployment._id);
        await this.model('User').findByIdAndUpdate(this.user, { 
            $push: { repositories: this._id, deployments: deployment._id } 
        });
    }catch(error){
        return next(error);
    }
    next();
});

const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;