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

const GithubSchema = new mongoose.Schema({
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

GithubSchema.plugin(TextSearch);
GithubSchema.index({ username: 'text' });

GithubSchema.post('save', async function(){
    const { user, _id } = this;
    await mongoose.model('User').findByIdAndUpdate(user, { github: _id });
}); 

GithubSchema.post('findOneAndDelete', async function(){
    const { user } = this;
    await mongoose.model('User').findByIdAndUpdate(user, { $unset: { github: 1 } });
});

const Github = mongoose.model('Github', GithubSchema);

module.exports = Github;