const errorHandler = (err, req, res, next) => {
    console.error("Error occurred:", err.stack || err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Customize error response based on error type if needed
    // if (err.name === 'ValidationError') { // Example for specific validation errors
    //   statusCode = 400;
    // }
    // if (err.code === 'SOME_DB_ERROR_CODE') { // Example for specific DB errors
    //    message = 'Database conflict occurred.';
    //    statusCode = 409; // Conflict
    // }

    if (statusCode < 100 || statusCode > 599) {
        console.warn(`Invalid status code ${statusCode} produced by error. Defaulting to 500.`);
        statusCode = 500;
    }


    res.status(statusCode).json({
        error: {
            message: message,
            status: statusCode,
            // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
    });
};

module.exports = errorHandler;