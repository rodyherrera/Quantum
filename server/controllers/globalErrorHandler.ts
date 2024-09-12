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

import RuntimeError from '@utilities/runtimeError';
import sendMail from '@services/sendEmail';
import { Request, Response, NextFunction } from 'express';

/**
 * Maps common errors to informative messages and appropriate HTTP status codes.
 *
 * @param {Error} err - The error object to analyze.
 * @returns {Object} An object containing 'message' (string) and 'statusCode' (number).
*/
const parseError = (err: Error) => {
    const errorMap: { [key: string]: any } = {
        CastError: { message: 'Database::Cast::Error', statusCode: 400 },
        ValidationError: () => {
            const { errors } = err as any;
            const fields = Object.keys(errors);
            return {
                message: errors?.[fields?.[0]]?.message || 'Database::Validation::Error',
                statusCode: 401
            }
        },
        JsonWebTokenError: { message: 'JWT::Error', statusCode: 401 },
        TokenExpiredError: { message: 'JWT::Expired', statusCode: 401 },
        MongoServerError: (code: number) => { 
            if(code === 11000) return { message: 'Database::Duplicated::Fields', statusCode: 400 };
            return { message: err.message, statusCode: (err as any).statusCode };
        }
    };
    const handler = errorMap[(err as any).name] || errorMap.MongoServerError; 
    // Allow customizing messages for MongoServerError based on the error code
    return typeof handler === 'function' ? handler((err as any).status) : handler; 
};

/**
 * Express middleware for centralized error handling.
 * 
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
*/
const errorHandler = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    (err as any).statusCode = (err as any).statusCode || 500;
    (err as any).message = err.message || 'Server Error';
    if(err instanceof RuntimeError){
        return res.status((err as any).statusCode).send({ status: 'error', message: err.message });
    }
    // Parse error for consistent responses
    const { message, statusCode } = parseError(err);
    await sendMail({
        subject: 'A runtime error has occurred.',
        html: `We have satisfactorily captured the error, it has been handled and a friendly response has been sent to the customer. However, we will provide you with the details of the event in order to be able to find out more about the registered problem.\n\n${message}\n${statusCode}(Status Code)`
    });
    res.status(statusCode).send({ status: 'error', message });
};

export default errorHandler;