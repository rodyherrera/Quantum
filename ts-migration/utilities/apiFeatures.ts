import { Document, Model, PopulateOptions } from 'mongoose';
import { filterObject } from '@utilities/runtime';
import RuntimeError from '@utilities/runtimeError';
import _ from 'lodash';

/**
 * Interface for the request query string.
 * @interface RequestQueryString
 * @property {string} [search] - Search query string.
 * @property {string} [page] - Page number.
 * @property {string} [sort] - Sort order.
 * @property {string} [limit] - Number of records to return.
 * @property {string} [fields] - Fields to select.
 * @property {PopulateOptions} [populate] - Populate options for related documents.
 * @property {any} [key: string] - Any other query parameter.
*/
interface RequestQueryString{
    search?: string,
    page?: string,
    sort?: string,
    limit?: string,
    fields?: string,
    populate?: PopulateOptions,
    [key: string]: any;
};

/**
 * Interface for the buffer object used to store query parameters.
 * @interface Buffer
 * @property {object} find - Find query object.
 * @property {any} sort - Sort order.
 * @property {string} select - Selected fields.
 * @property {number} skip - Number of records to skip.
 * @property {number} limit - Number of records to return.
 * @property {number} totalResults - Total number of matching records.
 * @property {number} skippedResults - Number of skipped records.
 * @property {number} page - Current page number.
 * @property {number} totalPages - Total number of pages.
*/
interface Buffer{
    find: object;
    sort: any;
    select: string;
    skip: number;
    limit: number;
    totalResults: number;
    skippedResults: number;
    page: number;
    totalPages: number;
};

/**
 * Interface for the options passed to the APIFeatures class.
 * @interface Options
 * @property {RequestQueryString} requestQueryString - Request query string object.
 * @property {Model<Document>} model - Mongoose model.
 * @property {string[]} fields - Array of fields to include in the query.
 * @property {string|PopulateOptions|(string|PopulateOptions)[]} [populate] - Populate options for related documents.
*/
interface Options{
    requestQueryString: RequestQueryString,
    model: Model<Document>;
    fields: string[],
    populate?: string | PopulateOptions | (string | PopulateOptions)[] | null;
};

/**
 * Class for handling API features such as search, filter, sort, pagination, 
 * and field selection.
 * @class APIFeatures
*/
class APIFeatures{
    private model: Model<Document>;
    private requestQueryString: RequestQueryString;
    private populate: string | PopulateOptions | (string | PopulateOptions)[] | null;
    private fields: string[];
    private buffer: Buffer;

    /**
     * Creates an instance of APIFeatures.
     * @constructor
     * @param {Options} options - Options object.
     * @param {RequestQueryString} options.requestQueryString - Request query string object.
     * @param {Model<Document>} options.model - Mongoose model.
     * @param {string[]} options.fields - Array of fields to include in the query.
     * @param {string|PopulateOptions|(string|PopulateOptions)[]} [options.populate] - Populate options for related documents.
    */
    constructor({ requestQueryString, model, fields = [], populate = null }: Options){
        this.model = model;
        this.requestQueryString = requestQueryString;
        this.fields = fields;
        this.populate = populate;
        this.buffer = {
            find: {},
            sort: {},
            select: '',
            skip: 0,
            limit: 0,
            totalResults: 0,
            skippedResults: 0,
            page: 1,
            totalPages: 1
        };
    }

    /**
     * Performs the query and returns the results.
     * @async
     * @returns {Promise<{records: Document[], totalResults: number, skippedResults: number, page: number, limit: number, totalPages: number}>} Query results and pagination data.
    */
    async perform(): Promise<{
        records: Document[];
        totalResults: number;
        skippedResults: number;
        page: number;
        limit: number;
        totalPages: number;
    }>{
        const { find, sort, select, skip, limit, totalResults, skippedResults, page, totalPages } = this.buffer;
        const query = this.model.find(find).skip(skip).limit(limit).sort(sort).select(select);
        if(this.populate){
            if(typeof this.populate === 'string' || Array.isArray(this.populate)){
                query.populate(this.populate as string | string[]);
            }else{
                query.populate(this.populate as PopulateOptions);
            }
        }
        const records = await query;
        return { records, totalResults, skippedResults, page, limit, totalPages };
    };

    /**
     * Applies a text search query based on the 'q' parameter in the request query string.
     * @returns {APIFeatures} The current instance of APIFeatures.
    */
    search(): APIFeatures{
        if(this.requestQueryString.q){
            const escapedTerm = _.escapeRegExp(this.requestQueryString.q);
            const query = { $text: { $search: escapedTerm } };
            this.buffer.sort = { score: { $meta: 'textScore' } };
            this.buffer.find = { ...this.buffer.find, ...query };
        }
        return this;
    };

    /**
     * Applies a filter based on the request query string parameters, excluding specific fields.
     * @returns {APIFeatures} The current instance of APIFeatures.
    */
    filter(): APIFeatures{
        const query = _.omit(this.requestQueryString, ['page', 'sort', 'limit', 'fields', 'populate']);
        const filter = filterObject(query, ...this.fields);
        this.buffer.find = { ...this.buffer.find, ...filter };
        return this;
    };

    /**
     * Applies a sort order based on the 'sort' parameter in the request query string.
     * @returns {APIFeatures} The current instance of APIFeatures.
    */
    sort(): APIFeatures{
        this.buffer.sort = (this.requestQueryString.sort)
            ? this.requestQueryString.sort.split(',').join(' ')
            : '-createdAt';
        return this;
    };

    /**
     * Applies a field selection based on the 'fields' parameter in the request query string.
     * @returns {APIFeatures} The current instance of APIFeatures.
    */
    limitFields(): APIFeatures{
        if(this.requestQueryString.fields){
            this.buffer.select = this.requestQueryString.fields.split(',').join(' ');
        }
        return this;
    };

    /**
     * Applies pagination based on the 'page' and 'limit' parameters in the request query string.
     * @async
     * @returns {Promise<APIFeatures>} The current instance of APIFeatures.
     * @throws {RuntimeError} If the requested page is out of range.
    */
    async paginate(): Promise<APIFeatures>{
        const limit = this.requestQueryString.limit ? parseInt(this.requestQueryString.limit, 10) : 100;
        if(limit === -1) return this;
        const page = this.requestQueryString.page ? parseInt(this.requestQueryString.page, 10) : 1;
        const skip = (page - 1) * limit;
        this.buffer.skip = skip;
        this.buffer.limit = limit;
        const recordsCount = await this.model.countDocuments(this.buffer.find);
        this.buffer.totalResults = recordsCount;
        this.buffer.page = page;
        this.buffer.skippedResults = skip;
        this.buffer.totalPages = Math.ceil(recordsCount / limit);
        if(this.requestQueryString.page && skip >= recordsCount){
            throw new RuntimeError('Core::PageOutOfRange', 404);
        }
        return this;
    };
};

export default APIFeatures;