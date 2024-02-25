/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

const APIFeatures = require('@utilities/apiFeatures');
const RuntimeError = require('@utilities/runtimeError');
const { catchAsync, filterObject, checkIfSlugOrId } = require('@utilities/runtime');

/**
 * Factory class to generate reusable controllers for Mongoose models.
 *
 * @class HandlerFactory
*/
class HandlerFactory{
    /**
     * Constructor for the HandlerFactory class.
     *
     * @param {Object} options - Configuration for the factory.
     * @param {import('mongoose').Model} options.model - The Mongoose model to manage.
     * @param {Array<string>} [options.fields] - Fields allowed for query and data population.
    */
    constructor({ model, fields = [] }){
        this.model = model;
        this.fields = fields;
    };

    /**
     * Handles DELETE requests, deleting a single document.
     *
     * @returns {import('express').RequestHandler} - Express middleware for DELETE routes.
    */
    deleteOne = () => catchAsync(async (req, res, next) => {
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
     * Handles UPDATE requests, updating a single document.
     *
     * @returns {import('express').RequestHandler} - Express middleware for UPDATE routes.
    */
    updateOne = () => catchAsync(async (req, res, next) => {
        const queryFilter = filterObject(req.body, ...this.fields)
        const databaseRecord = await this.model.findOneAndUpdate(
            checkIfSlugOrId(req.params.id),
            queryFilter, 
            { new: true, runValidators: true }
        );
        if(!databaseRecord){
            return next(new RuntimeError('Core::UpdateOne::RecordNotFound', 404));
        }
        res.status(200).json({
            status: 'success',
            data: databaseRecord
        });
    });

    /**
     * Handles POST requests, creating a new document.
     *
     * @returns {import('express').RequestHandler} - Express middleware for POST routes.
    */
    createOne = () => catchAsync(async (req, res) => {
        const queryFilter = filterObject(req.body, ...this.fields);
        const databaseRecord = await this.model.create(queryFilter);
        res.status(201).json({
            status: 'success',
            data: databaseRecord
        });
    });

    /**
     * Extracts and parses the `populate` query parameter (if any) for population options.
     *
     * @param {import('express').Query} requestQuery - The Express request query object.
     * @returns {string|null} - Populate string (space-separated) or null if not present. 
    */
    getPopulateFromRequest = (requestQuery) => {
        if(!requestQuery?.populate) return null;
        // Support both JSON & comma-separated (backwards compatibility) populate strings 
        return requestQuery.populate.startsWith('{')
            ? JSON.parse(requestQuery.populate).join(' ') // JSON parse for object syntax
            : requestQuery.populate.split(',').join(' '); 
    };

    /**
     * Handles GET requests for all documents, supports advanced features.
     *
     * @returns {import('express').RequestHandler} - Express middleware for GET (list) routes.
    */
    getAll = () => catchAsync(async (req, res) => {
        const populate = this.getPopulateFromRequest(req.query);
        const operations = (await new APIFeatures({
            requestQueryString: req.query,
            model: this.model,
            populate
        }).paginate());
        operations.filter().sort().limitFields().search();
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
     * Handles GET requests for a single document.
     * 
     * @returns {import('express').RequestHandler} - Express middleware for GET (single) routes.
    */
    getOne = () => catchAsync(async (req, res, next) => {
        const populate = this.getPopulateFromRequest(req.query);
        let databaseRecord = this.model.findOne(checkIfSlugOrId(req.params.id));
        if(populate)
            databaseRecord = databaseRecord.populate(populate);
        databaseRecord = await databaseRecord;
        if(!databaseRecord)
            return next(new RuntimeError('Core::GetOne::RecordNotFound', 404));
        res.status(200).json({
            status: 'success',
            data: databaseRecord
        });
    });
};

module.exports = HandlerFactory;