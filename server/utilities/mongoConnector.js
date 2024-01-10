const mongoose = require('mongoose');

const mongoConnector = async () => {
    const databaseName = process.env.NODE_ENV === 'production'
        ? process.env.PRODUCTION_DATABASE
        : process.env.DEVELOPMENT_DATABASE;

    console.log(`[Quantum Cloud]: Connecting to MongoDB (${databaseName})...`);
    const uri = process.env.MONGO_URI + '/' + databaseName;
    mongoose.set('strictQuery', false);
    mongoose.set('strictPopulate', false);
    try{
        await mongoose.connect(uri, { authSource: 'admin' });
        console.log('[Quantum Cloud]: Connected to MongoDB!');
    }catch(error){
        console.log('[Quantum Cloud]: An unhandled error has been ocurred while trying to connect to MongoDB.');
        console.log(error);
    }
};

module.exports = mongoConnector;