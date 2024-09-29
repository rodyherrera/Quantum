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

/**
 * This class manages API operations, including loading states, error handling,
 * and event-based communication for asynchronous data fetching tasks.
*/
class OperationHandler{
    /**
     * Constructor for the OperationHandler class.
     * 
     * @param {string} slice - The Redux Slice.
     * @param {function} dispatch - A dispatch function from Redux.
    */
    constructor(slice, dispatch){
        this.slice = slice;
        this.dispatch = dispatch;
        this.events = {};
    };

    /**
     * Registers an event listener for a specific operation event.
     *
     * @param {string} event - The name of the event to listen for ('response', 'error', 'finally', or custom events).
     * @param {function} callback - The function to execute when the event occurs.
    */
    on(event, callback){
        this.events[event] = callback;
    };

    /**
     * Emits a specified event, triggering any registered event listeners.
     * 
     * @param {string} event - The name of the event to emit.
     * @param {...*} args - Any arguments to pass to the event listener callback.
    */
    emit(event, ...args){
        this.events?.[event]?.(...args);
    };

    /**
     * Executes an API operation and manages related state updates and events.
     *
     * @param {object} config - Configuration for the API operation.
     * @param {function} config.api - The function that performs the API call.
     * @param {function} [config.loaderState] - A function to dispatch a loader state update (e.g., setting a loading flag to true or false).
     * @param {function} [config.responseState] - A function to dispatch a state update with the API response data.
     * @param {object} [config.query={}] - Query parameters for the API request.
    */
    async use({ api, loaderState, responseState, query = {} }){
        try{
            if(loaderState) this.dispatch(loaderState(true));
            const { data } = await api(query);
            this.emit('response', data);
            if(responseState) this.dispatch(responseState(data));
        }catch(error){
            this.dispatch(globalErrorHandler(error, this.slice));
            this.emit('error', error);
        }finally{
            if(loaderState) this.dispatch(loaderState(false));
            this.emit('finally');
        }
    };
};

export default OperationHandler;