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

import { globalErrorHandler } from '@services/core/operations';
import { errorTrackingMiddleware, timingMiddleware } from '@utilities/api/middlewares';
import EventManager from '@utilities/api/eventManager';

/**
 * This class manages API operations, including loading states, error handling,
 * and event-based communication for asynchronous data fetching tasks.
*/
class OperationHandler extends EventManager{
    /**
     * Constructor for the OperationHandler class.
     * 
     * @param {string} slice - The Redux Slice.
     * @param {function} dispatch - A dispatch function from Redux.
    */
    constructor(slice, dispatch, middlewares = []){
        super();
        this.slice = slice;
        this.dispatch = dispatch;
        this.middlewares = middlewares;
    }

    applyMiddlewares(config){
        return this.middlewares.reduce((modifiedConfig, middleware) => {
            return middleware(modifiedConfig);
        }, config);
    }

    updateState(state, value){
        if(typeof state === 'string'){
            this.dispatch(this.slice.setState({ path: state, value }));
        }else if(state?.slice && state?.path){
            this.dispatch(state.slice.setState({ path: state.path, value }));
        }
    }

    /**
     * Executes an API operation and manages related state updates and events.
    */
    async use(config){
        const modifiedConfig = this.applyMiddlewares(config);
        const { api, loaderState, responseState, statsState, query = {}, body = {} } = modifiedConfig;
        try{
            if(loaderState) this.updateState(loaderState, true);
            const { data, page, results } = await api({ query, body });
            this.emit('response', data);
            if(statsState) this.updateState(statsState, { page, results });
            if(responseState) this.updateState(responseState, data);
        }catch(error){
            this.dispatch(globalErrorHandler(error, this.slice));
            this.emit('error', error);
        }finally{
            if(loaderState) this.updateState(loaderState, false);
            this.emit('finally');
        }
    }
}

const createOperation = (slice, dispatch, middlewares = []) => {
    if(import.meta.env){
        middlewares.push(errorTrackingMiddleware, timingMiddleware);
    }
    return new OperationHandler(slice, dispatch, middlewares);
}

export default createOperation;