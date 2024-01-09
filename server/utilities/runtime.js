const mongoose = require('mongoose');

exports.connectToMongoDb = async () => {
    const databaseName = (process.NODE_ENV === 'production') 
        ? (process.env.PRODUCTION_DATABASE) : (process.env.DEVELOPMENT_DATABASE);
    console.log('[Quantum Cloud]: Connecting to MongoDB...');
    const mongoURI = process.env.MONGO_URI.replace('<DATABASE_NAME>', databaseName);
    mongoose.set('strictQuery', false);
    mongoose.set('strictPopulate', false);
    try{
        await mongoose.connect(mongoURI, { authSource: 'admin' });
        console.log('[Quantum Cloud]: Connected to MongoDB.');
    }catch(error){
        console.log('[Quantum Cloud]: Error connecting to MongoDB.');
        console.log(error);
    }
};

exports.filterObject = (object, ...fields) => {
    const filteredObject = {};
    Object.keys(object).forEach((key) =>
        (fields.includes(key)) && (filteredObject[key] = object[key]));
    return filteredObject;
};

exports.checkIfSlugOrId = (id) => {
    if(id.length === 24)
        return { _id: id };
    return { slug: id };
};

exports.catchAsync = (asyncFunction, finalFunction = undefined) => (req, res, next) => {
    let executeFinally = true;
    return asyncFunction(req, res, next)
        .catch(next)
        .catch(() => (executeFinally = false))
        .finally(() => setTimeout(() => 
            (executeFinally && typeof finalFunction === 'function') && (finalFunction(req)), 100));
};

module.exports = exports;