const mongoose = require('mongoose');
const TextSearch = require('mongoose-partial-search');

const DeploymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Deployment::User::Required'],
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        required: [true, 'Deployment::Repository::Required'],
    },
    environment: {
        name: String,
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
        enum: ['pending', 'success', 'failure'],
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

DeploymentSchema.post('findOneAndDelete', async function(){
    await this.model('User').findByIdAndUpdate(this.user, { $pull: { deployments: this._id } });
    await this.model('Repository').findByIdAndUpdate(this.repository, { $pull: { deployments: this._id } });
});

const Deployment = mongoose.model('Deployment', DeploymentSchema);

module.exports = Deployment;