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
import { IUser } from '@typings/models/user';
import { IDockerContainer } from '@typings/models/docker/container';

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
    portBindings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PortBinding'
    }],
    containers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DockerContainer'
    }],
    networks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DockerNetwork'
    }],
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DockerImage'
    }],
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

const cascadeDeleteHandler = async (document: IUser): Promise<void> => {
    if(!document) return;
    const query = { user: document._id };
    // check for errors (cascade in the others models)
    await mongoose.model('Repository').deleteMany(query);
    await mongoose.model('Github').findOneAndDelete(query);
    await mongoose.model('DockerNetwork').deleteMany(query);
    await mongoose.model('DockerContainer').deleteMany(query);
    await mongoose.model('DockerImage').deleteMany(query);
    await mongoose.model('PortBinding').deleteMany(query);
};

const createUserContainer = async (user: IUser): Promise<IDockerContainer> => {
    const userId = user._id.toString();
    const image = await mongoose.model('DockerImage').create({ name: 'alpine', tag: 'latest', user: userId });
    const network = await mongoose.model('DockerNetwork').create({ user: userId, driver: 'bridge', name: userId });
    const container = await mongoose.model('DockerContainer').create({
        name: userId,
        user: userId,
        image: image._id,
        network: network._id,
        command: '/bin/sh',
        isUserContainer: true
    });
    // push?
    user.images.push(image);
    user.networks.push(network);
    user.containers.push(container);
    return container;
};

UserSchema.pre('findOneAndDelete', async function(){
    const conditions = this.getQuery();
    const user = await mongoose.model('User').findOne(conditions).populate('container');
    await cascadeDeleteHandler(user);
});

UserSchema.pre('deleteMany', async function() {
    const conditions = this.getQuery();
    const users = await mongoose.model('User').find(conditions);
    await Promise.all(users.map(async (user) => {
        await cascadeDeleteHandler(user);
    }));
});

/**
 * Remove all whitespace from a string.
 * @param {string} str - The string to process.
 * @returns {string} - The string without whitespace.
*/
const removeWhitespace = (str: string): string => {
    return str.replace(/\s/g, '');
}

/**
 * Hash a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The hashed password.
 */
const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

UserSchema.pre('save', async function(next){
    try{
        /*

            TODO: GITHUB AUTH OPTIONAL!!!!!!!!!!!

        */
        if(!this.isModified('password')) return next();
        this.username = removeWhitespace(this.username);
        this.password = await hashPassword(this.password);
        this.passwordConfirm = undefined;

        if(this.isNew){
            this.container = await createUserContainer(this);
        }
        
        // Set the passwordChangedAt field if the password was 
        // modified and it's not a new document
        if(this.isModified('password') && !this.isNew){
            this.passwordChangedAt = new Date();
        }
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
