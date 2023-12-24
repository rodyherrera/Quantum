const mongoose = require('mongoose');
const TextSearch = require('mongoose-partial-search');

const GithubSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    githubId: {
        type: String,
        required: [true, 'Github::GithubId::Required'],
        unique: true
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

GithubSchema.pre('remove', async function(next){
    await this.model('User').findByIdAndUpdate(this.user, { github: undefined });
    next();
});

const Github = mongoose.model('Github', GithubSchema);

module.exports = Github;