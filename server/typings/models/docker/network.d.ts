import mongoose, { Document } from 'mongoose';

export interface IDockerNetwork{
    _id: mongoose.Schema.Types.ObjectId,
    user: mongoose.Schema.Types.ObjectId,
    containers: mongoose.Schema.Types.ObjectId[],
    name: string,
    subnet: string,
    driver: string,
    dockerNetworkName: string,
    createdAt: Date,
    updatedAt: Date
}