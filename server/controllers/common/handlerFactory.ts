import { Response, NextFunction, RequestHandler } from 'express';
import { IRequest } from '@typings/controllers/common';
import { Model } from 'mongoose';
import { catchAsync, filterObject, checkIfSlugOrId } from '@utilities/helpers';
import { IUser } from '@typings/models/user';
import type {
    HandlerFactoryOptions, 
    MiddlewareFunction, 
    HandlerFactoryMethodConfig 
} from '@typings/controllers/handlerFactory';
import APIFeatures from '@utilities/apiFeatures';
import RuntimeError from '@utilities/runtimeError';

class HandlerFactory{
    private model: Model<any>
    private fields: string[];

    constructor({ model, fields = [] }: HandlerFactoryOptions){
        this.model = model;
        this.fields = fields;
    }

    private async applyMiddlewares(
        middlewares: MiddlewareFunction[] = [],
        req: IRequest,
        data: any
    ): Promise<any>{
        if(middlewares.length === 0) return data;
        // Run middlewares in parallel if they are independent
        // If it depends on order, keep sequential execution
        // Here we assume that they are independent :)!
        const results = await Promise.all(middlewares.map((middleware) => middleware(req, data)));
        return results.reduce((acc, curr) => ({ ...acc, ...curr }), data);
    }

    private createHandler(
        operation: (req: IRequest, res: Response, next: NextFunction) => Promise<void>,
        config: HandlerFactoryMethodConfig = {}
    ): RequestHandler{
        return catchAsync(async (req: IRequest, res: Response, next: NextFunction) => {
            const { middlewares } = config;
            if(middlewares?.pre?.length){
                req.handlerData = await this.applyMiddlewares(middlewares.pre, req, req?.body);
            }
            await operation(req, res, next);
            if(res.locals.data && middlewares?.post?.length){
                res.locals.data = await this.applyMiddlewares(middlewares?.post, req, res.locals.data);
            }
        });
    }
    
    private createBody(res: Response, status: string, value: any){
        res.locals.data = value;
        const body = { status, data: value };
        return body;
    }

    deleteOne(config: HandlerFactoryMethodConfig = {}): RequestHandler{
        return this.createHandler(async (req, res, next) => {
            const query = { ...checkIfSlugOrId(req.params.id), ...req.handlerData };
            const record = await this.model.findOneAndDelete(query).lean();
            if(!record){
                return next(new RuntimeError('Core::DeleteOne::RecordNotFound', 404));
            }
            const body = this.createBody(res, 'success', record);
            await this.sendResponse(204, body, req, res, config);
        }, config);
    }

    updateOne(config: HandlerFactoryMethodConfig = {}): RequestHandler{
        return this.createHandler(async (req, res, next) => {
            const query = this.createQuery(req);
            const record = await this.model.findOneAndUpdate(
                checkIfSlugOrId(req.params.id),
                query,
                { new: true, runValidators: true, lean: true }
            );
            if(!record){
                return next(new RuntimeError('Core::UpdateOne::RecordNotFound', 404));
            }
            const body = this.createBody(res, 'success', record);
            await this.sendResponse(200, body, req, res, config);
        }, config);
    }

    private createQuery(req: IRequest): object{
        const query: any = { ...filterObject(req.body, ...this.fields), ...req.handlerData };
        if(this.fields.includes('user') && req.user){
            const authenticatedUser = req.user as IUser;
            query['user'] = (authenticatedUser.role === 'admin' && req.body.user)
                ? req.body.user
                : authenticatedUser._id;
        }
        return query;
    }

    private async sendResponse(
        status: number, 
        body: any, 
        req: IRequest, 
        res: Response, 
        config: HandlerFactoryMethodConfig
    ): Promise<void>{
        if(config.responseInterceptor){
            await config.responseInterceptor(req, res, body);
            return;
        }
        res.status(status).json(body);
    }

    createOne(config: HandlerFactoryMethodConfig = {}): RequestHandler{
        return this.createHandler(async (req, res) => {
            const query = this.createQuery(req);
            const record = await this.model.create(query);
            const body = this.createBody(res, 'success', record);
            await this.sendResponse(201, body, req, res, config);
        }, config);
    }

    private getPopulateFromRequest(query: any): string | null{
        const populate = query.populate;
        if(!populate) return null;
        if(populate.startsWith('{') || populate.startsWith('[')){
            try{
                const parsed = JSON.parse(populate);
                return Array.isArray(parsed) ? parsed.join(' ') : parsed;
            }catch(e){
                return null;
            }
        }
        return populate.split(',').join(' ');
    }

    getOne(config: HandlerFactoryMethodConfig = {}): RequestHandler{
        return this.createHandler(async (req, res, next) => {
            const populate = this.getPopulateFromRequest(req.query);
            let query = { ...checkIfSlugOrId(req.params.id), ...req.handlerData };
            let queryObj = this.model.findOne(query).lean();
            if(populate) queryObj = queryObj.populate(populate);
            let record = await queryObj.exec();
            if(!record){
                return next(new RuntimeError('Core::GetOne::RecordNotFound', 404));
            }
            const body = this.createBody(res, 'success', record);
            await this.sendResponse(200, body, req, res, config);
        }, config);
    }

    getAll(config: HandlerFactoryMethodConfig = {}): RequestHandler{
        return this.createHandler(async (req, res) => {
            const populate = this.getPopulateFromRequest(req.query);
            const operations = new APIFeatures({
                requestQueryString: req.query,
                model: this.model,
                fields: this.fields,
                populate: populate
            }).filter(req.handlerData).sort().limitFields().search();
            await operations.paginate();
            const { records, skippedResults, totalResults, page, limit, totalPages } = await operations.perform();
            res.locals.data = records;
            const body = {
                status: 'success',
                page: {
                    current: page,
                    total: totalPages
                },
                results: {
                    skipped: skippedResults,
                    total: totalResults,
                    paginated: limit
                },
                data: records
            };
            await this.sendResponse(200, body, req, res, config);
        }, config);
    }
}

export default HandlerFactory;