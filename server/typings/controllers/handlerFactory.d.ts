import { Model } from 'mongoose';
import { IRequest } from '@typings/controllers/common';
import { Response } from 'express';

/**
 * Interface for the options passed to the HandlerFactory class.
 * @interface HandlerFactoryOptions
 * @property {Model<any>} model - The Mongoose model.
 * @property {string[]} [fields] - An array of fields to include in the query.
*/
export interface HandlerFactoryOptions{
    model: Model<any>;
    fields?: string[];
}

export type MiddlewareFunction = (req: IRequest, data: any) => Promise<any>;

export interface HandlerFactoryMiddleware{
    pre?: MiddlewareFunction[];
    post?: MiddlewareFunction[];
}

export interface HandlerFactoryMethodConfig{
    middlewares?: HandlerFactoryMiddleware;
    responseInterceptor?: (req: IRequest, res: Response, body: any) => Promise<any>;
}