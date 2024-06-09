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

const mongoose = require('mongoose');

/**
 * Establishes a connection to the appropriate MongoDB database based on the environment.
 * Logs errors to the console for troubleshooting.
*/
const mongoConnector = async () => {
    const {
        NODE_ENV,
        PRODUCTION_DATABASE,
        DEVELOPMENT_DATABASE,
        MONGO_URI
    } = process.env;

    const databaseName = NODE_ENV === 'production' ? PRODUCTION_DATABASE : DEVELOPMENT_DATABASE;
    const uri = `${MONGO_URI}/${databaseName}`;

    console.log(`[Quantum Cloud] -> Connecting to MongoDB (${databaseName})...`);

    mongoose.set('strictQuery', false);
    mongoose.set('strictPopulate', false);
    
    const options = {
        maxPoolSize: 10, 
        autoIndex: NODE_ENV !== 'production', 
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000, 
        authSource: 'admin',
        appName: 'quantum-cloud',
        serverSelectionTimeoutMS: 5000,
        maxIdleTimeMS: 30000,
        retryWrites: true,
    };

    try{
        await mongoose.connect(uri, options);
        console.log(`[Quantum Cloud] -> Connected to MongoDB (${databaseName})!`);
    }catch(error){
        console.error('[Quantum Cloud] -> Error connecting to MongoDB:', error);
    }
};

module.exports = mongoConnector;