import mongoose, { Document } from 'mongoose';
import { IUser } from '@types/models/User';
import { IDeployment } from '@types/models/Deployment';

export interface IRepository extends Document{
    alias: string;
    _id: string | mongoose.Types.ObjectId;
    name: string;
    webhookId?: number;
    buildCommand?: string;
    installCommand?: string;
    startCommand?: string;
    rootDirectory?: string;
    user: mongoose.Schema.Types.ObjectId | IUser;
    url: string;
    deployments: mongoose.Schema.Types.ObjectId[] | IDeployment[];
    domains: string[];
    port?: number;
    createdAt: Date;
    updateAliasIfNeeded(): Promise<void>;
    getUserWithGithubData(): Promise<any>;
    updateUserAndRepository(deployment: any): Promise<void>;
}