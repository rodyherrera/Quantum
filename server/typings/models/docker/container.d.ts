import mongoose, { Document } from 'mongoose';

export interface IDockerContainerEnvironment{
    variables: Map<string, string>;
}

export interface IDockerContainer extends Document{
    _id: mongoose.Schema.Types.ObjectId,
    user: mongoose.Schema.Types.ObjectId,
    network: mongoose.Schema.Types.ObjectId,
    image: mongoose.Schema.Types.ObjectId,
    storagePath?: string,
    isUserContainer: boolean;
    environment: IDockerContainerEnvironment;
    status: string,
    startedAt?: Date,
    stoppedAt?: Date,
    name?: string,
    createdAt: Date,
    updatedAt: Date
}