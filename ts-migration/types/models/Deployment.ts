import mongoose, { Document } from 'mongoose';

interface ICommit{
    message?: string;
    author?: {
        name?: string;
        email?: string;
    };
    date?: Date;
}

export interface IEnvironment{
    variables: Map<string, string>;
}

export interface IDeployment extends Document{
    user: mongoose.Schema.Types.ObjectId;
    githubDeploymentId: string;
    repository: mongoose.Schema.Types.ObjectId;
    environment: IEnvironment;
    commit: ICommit;
    _id: string | mongoose.Types.ObjectId;
    status: 'pending' | 'success' | 'stopped' | 'failure' | 'queued';
    url?: string;
    createdAt?: Date;
    getFormattedEnvironment: () => string;
}
