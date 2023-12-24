const errorHandler = (err, req, res, next) => {
    res.status(err.statusCode || 500).send({
        status: err.statusCode || 500,
        message: err.message
    });
};

module.exports = errorHandler;