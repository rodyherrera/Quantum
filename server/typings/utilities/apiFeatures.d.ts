import { Document, Model, PopulateOptions } from 'mongoose';

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
export interface RequestQueryString {
    search?: string;
    page?: string;
    sort?: string;
    limit?: string;
    fields?: string;
    populate?: PopulateOptions;
    [key: string]: any;
}

/**
 * Interface for the buffer object used to store query parameters.
 * @interface Buffer
 * @property {Record<string, any>} find - Find query object.
 * @property {Record<string, any>} sort - Sort order.
 * @property {string} select - Selected fields.
 * @property {number} skip - Number of records to skip.
 * @property {number} limit - Number of records to return.
 * @property {number} totalResults - Total number of matching records.
 * @property {number} skippedResults - Number of skipped records.
 * @property {number} page - Current page number.
 * @property {number} totalPages - Total number of pages.
 */
export interface Buffer {
    find: Record<string, any>;
    sort: Record<string, any>;
    select: string;
    skip: number;
    limit: number;
    totalResults: number;
    skippedResults: number;
    page: number;
    totalPages: number;
}

/**
 * Interface for the options passed to the APIFeatures class.
 * @interface Options
 * @property {RequestQueryString} requestQueryString - Request query string object.
 * @property {Model<Document>} model - Mongoose model.
 * @property {string[]} fields - Array of fields to include in the query.
 * @property {string|PopulateOptions|(string|PopulateOptions)[]} [populate] - Populate options for related documents.
 */
export interface Options {
    requestQueryString: RequestQueryString;
    model: Model<Document>;
    fields: string[];
    populate?: string | PopulateOptions | (string | PopulateOptions)[] | null;
}
