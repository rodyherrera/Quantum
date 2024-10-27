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

import mongoose from 'mongoose';
import { IGithub } from '@typings/models/github';

const GithubSchema = new mongoose.Schema<IGithub>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    githubId: {
        type: String,
        required: [true, 'Github::GithubId::Required']
    },
    accessToken: {
        type: String,
        required: [true, 'Github::AccessToken::Required']
    },
    username: {
        type: String,
        required: [true, 'Github::Username::Required']
    },
    avatarUrl: {
        type: String
    }
});

GithubSchema.index({ username: 'text' });

const cascadeDeleteHandler = async (document: IGithub): Promise<void> => {
    await mongoose.model('User').findByIdAndUpdate(document.user, { $unset: { github: 1 } });
};

GithubSchema.post('save', async function(this: IGithub){
    const { user, _id } = this;
    await mongoose.model('User').findByIdAndUpdate(user, { github: _id });
}); 

GithubSchema.post('findOneAndDelete', async function (this: IGithub){
    await cascadeDeleteHandler(this);
});

GithubSchema.pre('deleteMany', async function(){
    const conditions = this.getQuery();
    const githubAccounts = await mongoose.model('Github').find(conditions);
    await Promise.all(githubAccounts.map(async (githubAccount) => {
        await cascadeDeleteHandler(githubAccount);
    }));
});

const Github = mongoose.model<IGithub>('Github', GithubSchema);

export default Github;
