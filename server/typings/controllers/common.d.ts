import { Request } from 'express';
import { IUser } from '@typings/models/user';

export interface IRequest extends Request{
    user?: null;
    handlerData?: null;
    query: any
}