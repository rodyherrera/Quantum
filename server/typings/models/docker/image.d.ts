import mongoose, { Document } from 'mongoose';

export interface IDockerImage extends Document{
    _id: mongoose.Schema.Types.ObjectId,
    user: mongoose.Schema.Types.ObjectId,
    containers: mongoose.Schema.Types.ObjectId[],
    name: string,
    tag: string,
    size?: number,
    createdAt: Date,
    updatedAt: Date
}