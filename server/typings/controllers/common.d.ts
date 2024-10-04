import { Request } from 'express';

export interface IRequest extends Request{
    user?: null;
    handlerData?: null;
}