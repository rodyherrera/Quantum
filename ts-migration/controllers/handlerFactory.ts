import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Document, Model } from 'mongoose';
import { catchAsync, filterObject, checkIfSlugOrId } from '@utilities/runtime';
import APIFeatures from '@utilities/apiFeatures';
import RuntimeError from '@utilities/runtimeError';

/**
 * Interface for the options passed to the HandlerFactory class.
 * @interface HandlerFactoryOptions
 * @property {Model<any>} model - The Mongoose model.
 * @property {string[]} [fields] - An array of fields to include in the query.
*/
interface HandlerFactoryOptions{
    model: Model<any>;
    fields?: string[];
};

/**
 * A class that provides reusable handlers for common CRUD operations.
 * @class HandlerFactory
*/
class HandlerFactory{
    private model: Model<any>;
    private fields: string[];

    /**
     * Creates an instance of HandlerFactory.
     * @constructor
     * @param {HandlerFactoryOptions} options - The options object.
    */
    constructor({ model, fields = [] }: HandlerFactoryOptions){
        this.model = model;
        this.fields = fields;
    };

    /**
     * Handler for deleting a single record.
     * @method deleteOne
     * @returns {RequestHandler} - The Express request handler.
    */
    deleteOne = (): RequestHandler => catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const databaseRecord = await this.model.findOneAndDelete(checkIfSlugOrId(req.params.id));
        if(!databaseRecord){
            return next(new RuntimeError('Core::DeleteOne::RecordNotFound', 404));
        }
        res.status(204).json({
            status: 'success', 
            data: databaseRecord 
        });
    });

    /**
     * Handler for updating a single record.
     * @method updateOne
     * @returns {RequestHandler} - The Express request handler.
    */
    updateOne = (): RequestHandler => catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const queryFilter = filterObject(req.body, ...this.fields);
        const databaseRecord = await this.model.findOneAndUpdate(
            checkIfSlugOrId(req.params.id),
            queryFilter,
            { new: true, runValidators: true });
        if(!databaseRecord){
            return next(new RuntimeError('Core::UpdateOne::RecordNotFound', 404));
        }
        res.status(200).json({
            status: 'success',
            data: databaseRecord
        });
    });

    /**
     * Handler for creating a new record.
     * @method createOne
     * @returns {RequestHandler} - The Express request handler.
    */
    createOne = (): RequestHandler => catchAsync(async (req: Request, res: Response) => {
        const queryFilter = filterObject(req.body, ...this.fields);
        const databaseRecord = await this.model.create(queryFilter);
        res.status(201).json({
            status: 'success',
            data: databaseRecord
        });
    });

    /**
     * Retrieves the populate option from the request query.
     * @method getPopulateFromRequest
     * @param {Request['query']} requestQuery - The request query object.
     * @returns {string|null} - The populate option as a string, or null if not provided.
    */
    getPopulateFromRequest = (requestQuery: Request['query']): string | null => {
        if(!requestQuery?.populate) return null;
        const populate = requestQuery.populate as string;
        return populate.startsWith('{')
            ? JSON.parse(populate).join(' ')
            : populate.split(',').join(' ');
    };

    /**
     * Handler for retrieving all records.
     * @method getAll
     * @returns {RequestHandler} - The Express request handler.
    */
    getAll = (): RequestHandler => catchAsync(async (req: Request, res: Response) => {
        const populate = this.getPopulateFromRequest(req.query);
        const operations = new APIFeatures({
            requestQueryString: req.query,
            model: this.model,
            fields: this.fields,
            populate
        }).filter().sort().limitFields().search();
        await operations.paginate();
        const { records, skippedResults, totalResults, page, limit, totalPages } = await operations.perform();
        res.status(200).json({
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
        });
    });

    /**
     * Handler for retrieving a single record.
     * @method getOne
     * @returns {RequestHandler} - The Express request handler.
    */
    getOne = (): RequestHandler => catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const populate = this.getPopulateFromRequest(req.query);
        let databaseRecord: Document<any, {}> | null = await this.model.findOne(checkIfSlugOrId(req.params.id));
        if(!databaseRecord){
            return next(new RuntimeError('Core::GetOne::RecordNotFound', 404));
        }
        if(populate){
            databaseRecord = await databaseRecord.populate(populate);
        }
        res.status(200).json({
            status: 'success',
            data: databaseRecord
        });
    });
};

export default HandlerFactory;