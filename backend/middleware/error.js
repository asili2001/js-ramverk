/**
 * Error handling middleware.
 */
"use strict";


// Catch 404 and forward to error handler
async function catchError(request, result, next) {
    var error = new Error("Not Found");
    error.status = 404;
    next(error);
};


// 404 error handler
export default async function errorHandler(error, request, result, next) {
    if (result.headersSent) {
        return next(error);
    }

    result.status(error.status || 500).json({
        "errors": [
            {
                "status": error.status,
                "title":  error.message,
                "detail": error.message
            }
        ]
    });
    next();
};


// EXPORT MIDDLEWARE
//module.exports = {
//    errorHandler: errorHandler,
//};
