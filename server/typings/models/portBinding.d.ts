import mongoose from 'mongoose';

export interface IPortBinding{
    internalPort: number,
    protocol: string;
    externalPort?: number;
    container: mongoose.Schema.Types.ObjectId
}