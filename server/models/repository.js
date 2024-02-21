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
const Github = require('@utilities/github');
const RepositoryHandler = require('@utilities/repositoryHandler');
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
    webhookId: String,
    buildCommand: { type: String, default: '' },
    installCommand: { type: String, default: '' },
    startCommand: { type: String, default: '' },
    rootDirectory: { type: String, default: '/' },
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
    createdAt: { type: Date, default: Date.now, },
});

RepositorySchema.plugin(TextSearch);
RepositorySchema.index({ alias: 1, user: 1 }, { unique: true });
RepositorySchema.index({ name: 'text', alias: 'text' });

const removeRepositoryReference = async (repository) => {
    const { user, _id, deployments } = repository;
    const updatedUser = await mongoose.model('User').findOneAndUpdate(
        { _id: user },
        { $pull: { repositories: _id, deployments: { $in: deployments } } },
        { new: true }
    ).populate('github');
    return updatedUser;
};

const getAndDeleteDeployments = async (repositoryId) => {
    const deployments = await mongoose.model('Deployment')
        .find({ repository: repositoryId })
        .select('githubDeploymentId');
    await mongoose.model('Deployment').deleteMany({ repository: repositoryId });
    return deployments;
};

const performCleanupTasks = async (deletedDoc, repositoryUser, deployments) => {
    const repositoryHandler = new RepositoryHandler(deletedDoc, repositoryUser);
    // repositoryHandler.logStream.end();
    repositoryHandler.removeFromRuntime();
    // Use Github utility for cleanup
    await Github.deleteLogAndDirectory(
        `${__dirname}/../storage/containers/${repositoryUser._id}/logs/${deletedDoc._id}.log`,
        `${__dirname}/../storage/containers/${repositoryUser._id}/github-repos/${deletedDoc._id}/`
    );
    const github = new Github(repositoryUser, deletedDoc);
    // Delete webhook and repository deployments
    await github.deleteWebhook();
    // The current deployment should be at index 0, and it 
    // cannot be deleted until it has changed its status to 
    // inactive. Well, Github prevents deleting an active deployment.
    const { githubDeploymentId: currentDeploymentId } = deployments[0];
    await github.updateDeploymentStatus(currentDeploymentId, 'inactive');
    // Now, that the current deployment is in an inactive 
    // state, it is possible to delete it, along with all the 
    // deployments that existed for the repository within our platform.
    for(const deployment of deployments){
        const { githubDeploymentId } = deployment;
        await github.deleteRepositoryDeployment(githubDeploymentId);
    }
};

const deleteRepositoryHandler = async (deletedDoc) => {
    // Remove repository reference from user's repositories array
    const repositoryUser = await removeRepositoryReference(deletedDoc);
    // Retrieve and delete deployments associated with the repository
    const deployments = await getAndDeleteDeployments(deletedDoc._id);
    // Perfom cleanup task using PTYhandler and Github utility
    await performCleanupTasks(deletedDoc, repositoryUser, deployments);
};

const handleUpdateCommands = async (context) => {
    const { buildCommand, installCommand, startCommand, rootDirectory } = context._update;
    const { _id } = context._conditions;
    if(
        rootDirectory.length || buildCommand.length ||
        installCommand.length || startCommand.length
    ){
        const { user, name, deployments } = await Repository
            .findById(_id)
            .select('user name deployments')
            .populate({ 
                path: 'user', select: 'username',
                populate: { path: 'github', select: 'accessToken username' }
            });
        const document = { user, name, deployments, buildCommand, 
            installCommand, startCommand, rootDirectory, _id };
        const repository = new RepositoryHandler(document, user);
        const github = new Github(user, document);
        repository.start(github);
    }
};

RepositorySchema.methods.updateAliasIfNeeded = async function(){
    const existingRepository = await mongoose.model('Repository')
        .findOne({ alias: this.alias, user: this.user });
    if(existingRepository){
        this.alias = this.alias + '-' + v4().slice(0, 4);
    }    
};

RepositorySchema.methods.getUserWithGithubData = async function(){
    const data = await mongoose.model('User')
        .findById(this.user)
        .populate('github');
    return data;
};

RepositorySchema.methods.updateUserAndRepository = async function(deployment){
    const updateUser = {
        $push: { repositories: this._id, deployments: deployment._id }
    };
    await mongoose.model('User').findByIdAndUpdate(this.user, updateUser);
    this.deployments.push(deployment._id);
};

RepositorySchema.pre('save', async function(next){
    try{
        if(!this.alias) this.alias = this.name;
        if(!this.isNew) return next();
        await this.updateAliasIfNeeded();
        const repositoryUser = await this.getUserWithGithubData();
        const github = new Github(repositoryUser, this);
        const deployment = await github.deployRepository();
        const webhookEndpoint = `${process.env.DOMAIN}/api/v1/webhook/${this._id}/`;
        try{
            this.webhookId = await github.createWebhook(webhookEndpoint, process.env.SECRET_KEY);
        }catch(err){
            if(err?.response?.data?.message !== 'Repository was archived so is read-only.')
                throw err;
        }
        await this.updateUserAndRepository(deployment);
        next();
    }catch(error){
        return next(error);
    }
});

RepositorySchema.post('findOneAndDelete', async function(deletedDoc){
    try{
        await deleteRepositoryHandler(deletedDoc);
    }catch(error){
        console.log('[Quantum Cloud]: Critical Error (@models/repository):', error);
    }
});

RepositorySchema.pre('findOneAndUpdate', async function(next){
    try{
        await handleUpdateCommands();
        next();
    }catch (error){
        next(error);
    }
});

const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;