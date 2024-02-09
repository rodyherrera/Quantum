const parseError = (err) => {
    const { name, code } = err;
    switch(name){
        case 'CastError':
            return ['Database::Cast::Error', 400];
        case 'ValidationError':
            return ['Database::Validation::Error', 400];
        case 'JsonWebTokenError':
            return ['JWT::Error', 401];
        case 'TokenExpiredError':
            return ['JWT::Expired', 401];
    };
    
    switch(code){
        case 11000:
            return ['Database::Duplicated::Fields', 400];
    }

    return [err.message, err.statusCode];
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Server Error';
    const [ message, statusCode ] = parseError(err);
    res.status(statusCode).send({
        status: 'error',
        message: message
    });
};

module.exports = errorHandler;