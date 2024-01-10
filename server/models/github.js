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
    await this.model('User').findByIdAndUpdate(user, { github: _id });
}); 

GithubSchema.post('findOneAndDelete', async function(){
    const { user } = this;
    await this.model('User').findByIdAndUpdate(user, { $unset: { github: 1 } });
});

const Github = mongoose.model('Github', GithubSchema);

module.exports = Github;