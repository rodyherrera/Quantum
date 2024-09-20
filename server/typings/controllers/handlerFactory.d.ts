import { Model } from 'mongoose';

/**
 * Interface for the options passed to the HandlerFactory class.
 * @interface HandlerFactoryOptions
 * @property {Model<any>} model - The Mongoose model.
 * @property {string[]} [fields] - An array of fields to include in the query.
*/
export interface HandlerFactoryOptions{
    model: Model<any>;
    fields?: string[];
};


export type MiddlewareFunction = (req: Request, data: any) => Promise<any>;

export interface HandlerFactoryMiddleware{
    pre?: MiddlewareFunction[];
    post?: MiddlewareFunction[];
}