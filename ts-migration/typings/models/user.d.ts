import mongoose, { Document } from 'mongoose';
import { IGithub } from './github';

export interface IUser extends Document{
    _id: string;
    username: string;
    repositories: mongoose.Types.ObjectId[];
    deployments: mongoose.Types.ObjectId[];
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