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

import mongoose, { Query } from 'mongoose';
import { IDeployment } from '@typings/models/deployment';

const DeploymentSchema = new mongoose.Schema<IDeployment>({
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
            of: String,
            default: () => new Map()
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

DeploymentSchema.index({ environment: 'text', commit: 'text', url: 'text' });

const cascadeDeleteHandler = async (document: IDeployment): Promise<void> => {
    const { user, repository, _id } = document;
    await mongoose.model('User').updateOne({ _id: user }, { $pull: { deployments: _id } });
    await mongoose.model('Repository').updateOne({ _id: repository }, { $pull: { deployments: _id } });
};

DeploymentSchema.post('findOneAndDelete', async function(deletedDoc: IDeployment){
    await cascadeDeleteHandler(deletedDoc);
});

DeploymentSchema.pre('deleteMany', async function() {
    const conditions = this.getQuery();
    const deployments = await mongoose.model('Deployment').find(conditions);
    await Promise.all(deployments.map(async (deployment) => {
        await cascadeDeleteHandler(deployment);
    }));
});

DeploymentSchema.methods.getFormattedEnvironment = function () {
    const formattedEnvironment = Array.from(
        this.environment.variables, ([key, value]) => `${key.trim()}="${value.trim()}"`);
    return formattedEnvironment.join(' ');
};

DeploymentSchema.post('findOneAndUpdate', async function (){
    const updatedDoc = await this.model.findOne(this.getFilter()).select('environment repository');
    if(updatedDoc){
        const { variables } = updatedDoc.environment;
        for(let [key, value] of variables){
            key = key.toLowerCase();
            if(!key.includes('port')) continue;
            await mongoose.model('Repository')
                .updateOne({ _id: updatedDoc.repository }, { port: value });
            break;
        }
    }
});

const Deployment = mongoose.model<IDeployment>('Deployment', DeploymentSchema);

export default Deployment;