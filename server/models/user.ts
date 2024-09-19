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

import mongoose, { Schema, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import logger from '@utilities/logger';
import UserContainer from '@services/userContainer';
import DockerImage from '@models/docker/image';
import DockerNetwork from '@models/docker/network';
import DockerContainer from '@models/docker/container';
import DockerContainerService from '@services/docker/container';
import path from 'path';
import { IUser } from '@typings/models/user';

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
    container: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DockerContainer'
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
        unique: true,
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
    const conditions = this.getQuery();
    const user = await mongoose.model('User').findOne(conditions).populate('container');
    if(!user) return;
    await mongoose.model('Repository').deleteMany({ user: user._id });
    await mongoose.model('Github').findOneAndDelete({ user: user._id });
    const container = new UserContainer(user);
    container.remove().then().catch((error: Error) => {
        logger.error(`CRITICAL ERROR (at @models/user - pre findOneAndDelete middleware): ${error}`)
    });
});

UserSchema.pre('save', async function(next){
    try{
        if(this.isNew){
            const userId = this._id.toString();
            const containerImage = await DockerImage.create({
                name: 'alpine',
                tag: 'latest',
                user: userId
            });
            const containerNetwork = await DockerNetwork.create({
                user: userId,
                driver: 'bridge',
                name: userId
            });
            const container = await DockerContainer.create({
                name: userId,
                user: userId,
                image: containerImage._id,
                network: containerNetwork._id
            });
            const containerId = container._id.toString();
            // duplicated code
            const containerStoragePath = path.join('/var/lib/quantum', process.env.NODE_ENV as string, 'containers', userId);
            await DockerContainer.updateOne({ _id: containerId }, { storagePath: containerStoragePath });
            container.storagePath = containerStoragePath;
            this.container = container;
            const containerService = new DockerContainerService(container);
            await containerService.createAndStartContainer();
        }
        if(!this.isModified('password')) return next();
        this.username = this.username.replace(/\s/g, '');
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
        /*if(this.isNew && !process.env.IS_CLI){
            const container = new UserContainer(this);
            container.start().then().catch((error: Error) => {
                logger.error(`CRITICAL ERROR (at @models/user - pre save middleware): ${error}`)
            });
        }*/
        if(!this.isModified('password') || this.isNew) return next();
        this.passwordChangedAt = new Date();
        next();
    }catch(error: any){
        next(error);
    }
});

UserSchema.methods.isCorrectPassword = async function(candidatePassword: string, userPassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.isPasswordChangedAfterJWFWasIssued = function(JWTTimeStamp: number): boolean {
    if(this.passwordChangedAt){
        const changedTimeStamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
        return JWTTimeStamp < changedTimeStamp;
    }
    return false;
};

const User: Model<IUser> = mongoose.model('User', UserSchema);

export default User;
