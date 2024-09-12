import mongoose from 'mongoose';
import logger from '@utilities/logger';

/**
 * Establishes a connection to the appropriate MongoDB database based on the environment.
 * Logs errors to the console for troubleshooting.
 */
const mongoConnector = async (): Promise<void> => {
    const {
        NODE_ENV,
        PRODUCTION_DATABASE,
        DEVELOPMENT_DATABASE,
        MONGO_AUTH_SOURCE,
        MONGO_URI
    } = process.env;

    const databaseName = NODE_ENV === 'production'? PRODUCTION_DATABASE : DEVELOPMENT_DATABASE;
    const uri = `${MONGO_URI}/${databaseName}`;

    logger.info(` -> Connecting to MongoDB (${databaseName})...`);

    mongoose.set('strictQuery',false);
    mongoose.set('strictPopulate',false);

    const options = {
        maxPoolSize:10,
        autoIndex:NODE_ENV !== 'production',
        connectTimeoutMS:10000,
        socketTimeoutMS:45000,
        authSource:MONGO_AUTH_SOURCE,
        appName:'quantum-cloud',
        serverSelectionTimeoutMS:5000,
        maxIdleTimeMS:30000,
        retryWrites:true
    };

    try{
        await mongoose.connect(uri,options);
        logger.info(` -> Connected to MongoDB (${databaseName})!`);
    }catch(error){
        logger.error(' -> Error connecting to MongoDB:',error);
    }
};

export default mongoConnector;
