import mongoose, { Document } from 'mongoose';

export interface IDockerContainerEnvironment{
    variables: Map<string, string>;
}

export interface IDockerContainerPortBindings{
    internalPort: number;
    externalPort: number;
    protocol: string;
}

export interface IDockerContainer extends Document{
    _id: mongoose.Schema.Types.ObjectId,
    user: mongoose.Schema.Types.ObjectId,
    portBindings: IDockerContainerPortBindings[];
    network: mongoose.Schema.Types.ObjectId,
    image: mongoose.Schema.Types.ObjectId,
    dockerContainerName: string;
    ipAddress?: string;
    command: string;
    storagePath?: string,
    isUserContainer: boolean;
    environment: IDockerContainerEnvironment;
    status: string,
    startedAt?: Date,
    stoppedAt?: Date,
    name: string,
    createdAt: Date,
    updatedAt: Date
}