/**
 * Logs middleware for request methods and paths on all routes.
 */
"use strict";

// MIDDLEWARE FOR ALL ROUTES USING MORGAN
async function logs(request, result, next) {
    console.log(req.method);
    console.log(req.path);
    next();
}

// EXPORT MIDDLEWARE
module.exports = {
    logs: logs
};
