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

class OperationHandler{
    constructor(slice, dispatch){
        this.slice = slice;
        this.dispatch = dispatch;
        this.events = {};
    };

    on(event, callback){
        this.events[event] = callback;
    };

    emit(event, ...args){
        this.events?.[event]?.(...args);
    };

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