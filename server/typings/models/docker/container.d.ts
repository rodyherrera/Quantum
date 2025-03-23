import mongoose, { Document } from 'mongoose';

export interface IDockerContainerEnvironment{
    isEncrypted: boolean;
    variables: Map<string, string>;
}

export interface IDockerContainerPortBindings{
    internalPort: number;
    externalPort: number;
    protocol: string;
}

export interface IDockerContainerVolume{
    containerPath: string;
    mode: string;
}

export interface FileInfo{
    name: string;
    isDirectory: boolean;
}

export interface ExecResult{
    output: string;
    exitCode: number;
    error?: string;
}

export interface IDockerContainer extends Document{
    _id: mongoose.Schema.Types.ObjectId,
    user: mongoose.Schema.Types.ObjectId,
    repository: mongoose.Schema.Types.ObjectId,
    isRepositoryContainer: boolean;
    portBindings: IDockerContainerPortBindings[];
    network: mongoose.Schema.Types.ObjectId,
    image: mongoose.Schema.Types.ObjectId,
    dockerContainerName: string;
    ipAddress?: string;
    command: string;
    volumes: IDockerContainerVolume[];
    storagePath: string,
    isUserContainer: boolean;
    environment: IDockerContainerEnvironment;
    status: string,
    startedAt?: Date,
    stoppedAt?: Date,
    name: string,
    createdAt: Date,
    updatedAt: Date
}