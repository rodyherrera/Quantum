const mongoose = require('mongoose');
const TextSearch = require('mongoose-partial-search');

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
    await this.model('Deployment').deleteMany({ repository: this._id });
    next();
});

const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;