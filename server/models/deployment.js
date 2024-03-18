/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

const mongoose = require('mongoose');
const TextSearch = require('mongoose-partial-search');

const DeploymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Deployment::User::Required']
    },
    githubDeploymentId: {
        type: String,
        required: [true, 'Deployment::GithubDeploymentId::Required']
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        required: [true, 'Deployment::Repository::Required']
    },
    environment: {
        variables: {
            type: Map,
            of: String
        }
    },
    commit: {
        message: String,
        author: {
            name: String,
            email: String
        },
        date: Date
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'stopped', 'failure', 'queued'],
        default: 'pending'
    },
    url: { type: String },
    createdAt: { type: Date, default: Date.now }
});

DeploymentSchema.plugin(TextSearch);
DeploymentSchema.index({ environment: 'text', commit: 'text', url: 'text' });

DeploymentSchema.methods.getFormattedEnvironment = function(){
    const formattedEnvironment = Array.from(
        this.environment.variables, ([key, value]) => `${key.trim()}="${value.trim()}"`);
    return formattedEnvironment.join(' ');
};

DeploymentSchema.post('findOneAndUpdate', async function(){
    const updatedDoc = await this.model.findOne(this._conditions).select('environment repository');
    const { variables } = updatedDoc.environment;
    for(let [key, value] of variables){
        key = key.toLowerCase();
        if(!key.includes('port')) continue;
        await mongoose.model('Repository')
            .updateOne({ _id: updatedDoc.repository }, { port: value });
        // first match, break "for" loop
        break;
    }
});

DeploymentSchema.post('findOneAndDelete', async function(){
    const { user, repository, _id } = this;

    const userUpdatePromise = await mongoose.model('User')
        .updateOne({ _id: user }, { $pull: { deployments: _id } }).lean().exec();
    const repoUpdatePromise = await mongoose.model('Repository')
        .updateOne({ _id: repository }, { $pull: { deployments: _id } }).lean().exec();

    await Promise.all([userUpdatePromise, repoUpdatePromise]);
});

const Deployment = mongoose.model('Deployment', DeploymentSchema);

module.exports = Deployment;
