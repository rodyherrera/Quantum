const mongoose = require('mongoose');
const TextSearch = require('mongoose-partial-search');
const simpleGit = require('simple-git');

const RepositorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Repository::Name::Required'],
        unique: true,
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
});

RepositorySchema.pre('save', async function(next){
    try{
        console.log(`Cloning ${this.url} to ./storage/repositories/${this._id}`);
        await simpleGit().clone(this.url, `./storage/repositories/${this._id}`);
    }catch(error){
        console.log(error)
    }
    next();
});

const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;