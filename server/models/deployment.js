const mongoose = require('mongoose');
const TextSearch = require('mongoose-partial-search');

const DeploymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Deployment::User::Required'],
    },
    githubDeploymentId: {
        type: String,
        required: [true, 'Deployment::GithubDeploymentId::Required']
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        required: [true, 'Deployment::Repository::Required'],
    },
    environment: {
        variables: {
            type: Map,
            of: String,
        },
    },
    commit: {
        message: String,
        author: {
            name: String,
            email: String,
        },
        date: Date,
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'stopped', 'failure'],
        default: 'pending'
    },
    url: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

DeploymentSchema.plugin(TextSearch);
DeploymentSchema.index({ environment: 'text', commit: 'text', url: 'text' });

DeploymentSchema.methods.getFormattedEnvironment = function(){
    const formattedEnvironment = [];
    this.environment.variables.forEach((value, key) => {
        key = key.trim();
        value = value.trim();
        const formattedValue = `${key}=${value}`;
        formattedEnvironment.push(formattedValue);
    });
    return formattedEnvironment.join(' && ');
};

DeploymentSchema.post('findOneAndDelete', function(){
    const { user, repository, _id } = this;

    const userUpdatePromise = this.model('User').updateOne({ _id: user }, { $pull: { deployments: _id } }).lean().exec();
    const repoUpdatePromise = this.model('Repository').updateOne({ _id: repository }, { $pull: { deployments: _id } }).lean().exec();

    return Promise.all([userUpdatePromise, repoUpdatePromise]);
});

const Deployment = mongoose.model('Deployment', DeploymentSchema);

module.exports = Deployment;