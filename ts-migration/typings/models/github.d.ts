import mongoose, { Document } from 'mongoose';

export interface IGithub extends Document{
    user: mongoose.Schema.Types.ObjectId;
    githubId: string;
    accessToken: string;
    username: string;
    avatarUrl?: string;
}