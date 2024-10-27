import mongoose from 'mongoose';
import { IDockerContainer } from './docker/container';

export interface IPortBinding{
    internalPort: number,
    protocol: string;
    externalPort?: number;
    user: mongoose.Schema.Types.ObjectId,
    container: mongoose.Schema.Types.ObjectId | IDockerContainer
}