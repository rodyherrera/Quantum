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
 * @class RuntimeError 
 * @description Represents a custom error specifically designed for runtime issues within the Quantum Cloud environment.
 * @extends Error
*/
class RuntimeError extends Error{
    /**
     * @constructor
     * @param {string} message - Descriptive error message explaining the runtime problem.
     * @param {number} statusCode - An HTTP-like status code for categorizing the error.
    */
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
};

module.exports = RuntimeError;