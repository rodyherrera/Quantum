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

import mongoose, { Document, Schema, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import UserContainer from '@services/userContainer';

interface IUser extends Document {
    username: string;
    repositories: mongoose.Types.ObjectId[];
    deployments: mongoose.Types.ObjectId[];
    github: mongoose.Types.ObjectId;
    fullname: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: 'user' | 'admin';
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    isCorrectPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
    isPasswordChangedAfterJWFWasIssued(JWTTimeStamp: number): boolean;
}

const UserSchema: Schema<IUser> = new Schema({
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
            validator:function(v:string):boolean{
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

UserSchema.index({ username: 'text', fullname: 'text', email: 'text' });

UserSchema.pre('findOneAndDelete', async function(){
    const user = this._conditions as IUser;
    await mongoose.model('Repository').deleteMany({ user: user._id });
    await mongoose.model('Github').findOneAndDelete({ user: user._id });
    const container = global.userContainers[user._id];
    container.remove().then().catch((error: Error) => {
        console.log(`[Quantum Cloud] CRITICAL ERROR (at @models/user - pre findOneAndDelete middleware): ${error}`)
    });
});

UserSchema.pre('save', async function(next){
    try{
        if(!this.isModified('password')) return next();
        this.username = this.username.replace(/\s/g, '');
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
        if(this.isNew && global?.logStreamStore !== undefined){
            const container = new UserContainer(this);
            container.start().then().catch((error: Error) => {
                console.log(`[Quantum Cloud] CRITICAL ERROR (at @models/user - pre save middleware): ${error}`)
            });
        }
        if(!this.isModified('password') || this.isNew) return next();
        this.passwordChangedAt = Date.now() - 1000;
        next();
    }catch(error){
        next(error);
    }
});

UserSchema.methods.isCorrectPassword = async function(candidatePassword: string, userPassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.isPasswordChangedAfterJWFWasIssued = function(JWTTimeStamp: number): boolean {
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStamp < changedTimeStamp;
    }
    return false;
};

const User: Model<IUser> = mongoose.model('User', UserSchema);

export default User;
