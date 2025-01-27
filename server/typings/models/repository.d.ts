import mongoose, { Document } from 'mongoose';
import { IUser } from './user';
import { IDeployment } from './deployment';
import { IDockerContainer } from './docker/container';

export interface IRepository extends Document{
    alias: string;
    _id: string | mongoose.Types.ObjectId;
    name: string;
    branch: string;
    webhookId?: number;
    buildCommand?: string;
    installCommand?: string;
    startCommand?: string;
    rootDirectory?: string;
    container: mongoose.Schema.Types.ObjectId | IDockerContainer;
    user: mongoose.Schema.Types.ObjectId | IUser;
    url: string;
    activeDeployment?: IDeployment,
    deployments: mongoose.Types.ObjectId[],
    port?: number;
    createdAt: Date;
    updateAliasIfNeeded(): Promise<void>;
    getUserWithGithubData(): Promise<any>;
    updateUserAndRepository(deployment: any): Promise<void>;
}