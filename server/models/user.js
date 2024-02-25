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
const validator = require('validator');
const bcrypt = require('bcryptjs');
const TextSearch = require('mongoose-partial-search');
const UserContainer = require('@utilities/userContainer');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: [8, 'User::Username::MinLength'],
        maxlength: [16, 'User::Username::MaxLength'],
        required: [true, 'User::Username::Required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    repositories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository'
    }],
    deployments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deployment'
    }],
    github: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Github'
    },
    fullname: {
        type: String,
        minlength: [8, 'User::Fullname::MinLength'],
        maxlength: [32, 'User::Fullname::MaxLength'],
        required: [true, 'User::Fullname::Required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'User::Email::Required'],
        unique: [true, 'User::Email::Unique'],
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'User::Email::Validate']
    },
    password: {
        type: String,
        required: [true, 'User::Password::Required'],
        minlength: [8, 'User::Password::MinLength'],
        maxlength: [16, 'User::Password::MaxLength'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'User::PasswordConfirm::Required'],
        validate: {
            validator: function(v){
                return v === this.password;
            },
            message: 'User::PasswordConfirm::Validate'
        }
    },
    role: {
        type: String,
        lowercase: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

UserSchema.plugin(TextSearch);
UserSchema.index({ username: 'text', fullname: 'text', email: 'text' });

UserSchema.pre('findOneAndDelete', async function(){
    const user = this._conditions;
    await mongoose.model('Repository').deleteMany({ user: user._id });
    // You won't need to use "Deployment.deleteMany" because when 
    // deleting the user, the associated repositories are also 
    // deleted using "deleteMany" in the respective model. This 
    // action automatically removes the related deployments. Repeating 
    // the process is unnecessary computational overhead.
    // await mongoose.model('Deployment').deleteMany({ user: user._id });
    await mongoose.model('Github').findOneAndDelete({ user: user._id });
    const container = global.userContainers[user._id];
    // .then() to avoid I/O blocking, do this better in future versions.
    container.remove().then().catch((error) => {
        console.log(`[Quantum Cloud] CRITICAL ERROR (at @models/user - pre findOneAndDelete middleware): ${error}`)
    });
});

// DOCKER CONTAINER IS CREATED IF ERROR EXISTS
UserSchema.pre('save', async function(next){
    try{
        // The existence of "global.logStreamStore" is checked 
        // because it is an object that is created when the server runs. 
        // However, when you run the CLI and choose the "Create new user" 
        // option, this code is also executed, but the variable does not 
        // exist. Therefore, if it does not exist, the code block inside 
        // is not executed.
        if(this.isNew && global?.logStreamStore !== undefined){
            const container = new UserContainer(this);
            // "container.start()" returns a promise, however this 
            // takes a little time, which will make it take time to 
            // load after sending the form to create the account. By 
            // not using await and using .then() we avoid blocking I/O. 
            // However, this must be implemented in a better way.
            container.start().then().catch((error) => {
                console.log(`[Quantum Cloud] CRITICAL ERROR (at @models/user - pre save middleware): ${error}`)
            });
        }
        if(!this.isModified('password')) return next();
        this.username = this.username.replace(/\s/g, '');
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
        
        if(!this.isModified('password') || this.isNew) return next();
        this.passwordChangedAt = Date.now() - 1000;
        next();
    }catch(error){
        next(error);
    }
});

UserSchema.methods.isCorrectPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.isPasswordChangedAfterJWFWasIssued = function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStamp < changedTimeStamp;
    }
    return false;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;