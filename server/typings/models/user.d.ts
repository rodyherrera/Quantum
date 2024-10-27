import mongoose, { Document } from 'mongoose';
import { IGithub } from './github';
import { IDockerContainer } from './docker/container';

export interface IUser extends Document{
    _id: string;
    username: string;
    container: mongoose.Schema.Types.ObjectId | IDockerContainer;
    repositories: mongoose.Types.ObjectId[];
    deployments: mongoose.Types.ObjectId[];
    containers: mongoose.Types.ObjectId[];
    portBindings: mongoose.Types.ObjectId[];
    images: mongoose.Types.ObjectId[];
    networks: mongoose.Types.ObjectId[];
    github: mongoose.Types.ObjectId | IGithub;
    fullname: string;
    email: string;
    password: string;
    passwordConfirm: string | undefined;
    role: 'user' | 'admin';
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    isCorrectPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
    isPasswordChangedAfterJWFWasIssued(JWTTimeStamp: number): boolean;
}