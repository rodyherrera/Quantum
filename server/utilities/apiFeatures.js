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

/**
 * This class provides a convenient way to add common API features  
 * (searching, filtering, sorting, field selection, and pagination) to Mongoose queries. 
 * It encapsulates the logic for building and executing custom queries. 
*/
class APIFeatures{
    /**
     * Creates a new instance of the APIFeatures class.
     *
     * @param {Object} options
     * @param {Object} options.requestQueryString - The query parameters from an API request.
     * @param {Object} options.model - The Mongoose model to apply the features to.
     * @param {string|Object} options.populate - Optional: Fields to populate in the results.
    */
    constructor({ requestQueryString, model, populate = null }){
        this.model = model;
        this.requestQueryString = requestQueryString;
        this.populate = populate;

        /**
         * An object used to store intermediate query settings and metadata.
         * 
         * @property {Array} find - Accumulates conditions for the `find` method of a Mongoose query.
         * @property {Object} sort - Sorting criteria for the `sort` method.
         * @property {string} select - Fields to select for the `select` method.
         * @property {number} skip - Number of documents to skip for pagination.
         * @property {number} limit - Maximum number of documents to return per page.
         * @property {number} totalResults - Total count of matching documents (before pagination).
         * @property {number} skippedResults - Number of documents skipped due to pagination. 
         * @property {number} page - Current page number.
         * @property {number} totalPages - Total number of pages.
        */
        this.buffer = {
            find: [],
            sort: {},
            select: '',
            skip: 0,
            limit: 0,
            totalResults: 0,
            skippedResults: 0,
            page: 1,
            totalPages: 1
        };
    };

    /**
     * Chains all query-building operations and returns the final query result along with pagination metadata.
     * 
     * @returns {Promise<Object>} An object containing:
     *   * records: The array of documents matching the query.
     *   * totalResults: Total count of matching documents (before pagination).
     *   * skippedResults: Number of documents skipped due to pagination.
     *   * page: Current page number.
     *   * limit: Maximum number of documents per page.
     *   * totalPages: Total number of pages.
    */
    async perform(){
        const { find, sort, select, skip, limit, totalResults, skippedResults, page, totalPages } = this.buffer;
        const query = this.model.find(...find).skip(skip).limit(limit).sort(sort).select(select);
        if(this.populate !== null){
            query.populate(this.populate);
        }
        const records = await query;
        return { records, totalResults, skippedResults, page, limit, totalPages };
    };

    /**
     * Adds a search condition to the query based on the `search` query parameter.
     * 
     * @returns {APIFeatures} - Returns the current instance for method chaining.
    */
    search(){
        if(this.requestQueryString.search){
            this.buffer.find.push(this.model.searchBuilder(this.requestQueryString.search));
        }
        return this;
    };

    /**
     * Adds filtering conditions to the query based on query parameters (excluding reserved keywords).
     *
     * @returns {APIFeatures} - Returns the current instance for method chaining.
    */
    filter(){
        const query = { ...this.requestQueryString };
        ['page', 'sort', 'limit', 'fields', 'populate'].forEach((element) => delete query[element]);
        const filter = JSON.parse(JSON.stringify(query).replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`));
        this.buffer.find.push(filter);
        return this;
    };

    /**
     * Configures how the query results should be sorted.
     *
     * @returns {APIFeatures} - Returns the current instance for method chaining. 
    */
    sort(){
        this.buffer.sort = (this.requestQueryString.sort)
            ? this.requestQueryString.sort.split(',').join(' ')
            : '-createdAt';
        return this;
    };

    /**
     * Limits the returned document fields based on the `fields` query parameter.
     *
     * @returns {APIFeatures} - Returns the current instance for method chaining.
    */
    limitFields(){
        if(this.requestQueryString.fields){
            this.buffer.select = this.requestQueryString.fields.split(',').join(' ');
        }
        return this;
    }

    /**
     * Implements pagination logic for the query. Calculates the number of documents to skip and the maximum number of results per page.
     *
     * @returns {APIFeatures} - Returns the current instance for method chaining.
     * @throws {RuntimeError} - If an invalid page number is requested (out of range).
    */
    async paginate(){
        if(this.requestQueryString.limit * 1 === -1)
            return this;
        const page = this.requestQueryString.page * 1 || 1;
        const limit = this.requestQueryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.buffer.skip = skip;
        this.buffer.limit = limit;
        const recordsCount = await this.model.countDocuments();
        this.buffer.totalResults = recordsCount;
        this.buffer.page = page;
        this.buffer.skippedResults = skip;
        this.buffer.totalPages = Math.ceil(recordsCount / limit);
        if(this.requestQueryString.page){
            if(skip >= recordsCount && recordsCount.length >= 1)
                throw new RuntimeError('Core::PageOutOfRange', 404);
        }
        return this;
    };
};

module.exports = APIFeatures;