import mongoose, { Document } from 'mongoose';

export interface IDockerNetwork{
    user: mongoose.Schema.Types.ObjectId,
    containers: mongoose.Schema.Types.ObjectId[],
    name: string,
    driver: string,
    createdAt: Date,
    updatedAt: Date
}