import { IRepository } from '@typings/models/repository';
import { IUser } from '@typings/models/user';
import { Socket } from 'socket.io';

export interface ISocket extends Socket{
    user: IUser;
    repository: IRepository;
}

export type WsNextFunction = (error?: any) => Promise<void>;