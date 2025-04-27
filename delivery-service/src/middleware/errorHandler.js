module.exports = (error, req, res, next) => {
    console.error(error.stack);
    res.status(error.status || 500).json({
        error: {
            message: error.message || 'Internal Server Error',
            status: error.status || 500
        }
    });
};