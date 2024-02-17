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
const fs = require('fs');

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

UserSchema.methods.deleteAssociatedData = async function(){
    await fs.promises.rm(`${__dirname}/../storage/containers/${this._id}/logs/${this._id}.log`);
    await this.model('Github').findOneAndRemove({ user: this._id });
    await this.model('Deployment').deleteMany({ user: this._id });
};

UserSchema.post('findOneAndDelete', async function(next){
    await this.deleteAssociatedData();
    next();
});

UserSchema.pre('save', async function(next){
    try{
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