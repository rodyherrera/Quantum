import mongoose, { Document, Schema } from 'mongoose';

export interface IGithub extends Document{
    user: mongoose.Schema.Types.ObjectId;
    githubId: string;
    accessToken: string;
    username: string;
    avatarUrl?: string;
    getDecryptedAccessToken(): string;
}