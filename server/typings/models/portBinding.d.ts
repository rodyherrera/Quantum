import mongoose from 'mongoose';

export interface IPortBinding{
    internalPort: number,
    protocol: string;
    externalPort?: number;
    user: mongoose.Schema.Types.ObjectId,
    container: mongoose.Schema.Types.ObjectId
}