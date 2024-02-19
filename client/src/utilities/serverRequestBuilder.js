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

export default class ServerRequestBuilder{
    handleRejection(error){
        if(error?.response?.data?.message){
            return error.response.data.message;
        }
        return error.message;
    };

    register({ callback, args }){
        return new Promise(async (resolve, reject) => {
            try{
                const response = await callback(...(args || []));
                resolve(response?.data || response);
            }catch(rejection){
                const error = this.handleRejection(rejection);
                reject(error);
            }
        });
    };
};