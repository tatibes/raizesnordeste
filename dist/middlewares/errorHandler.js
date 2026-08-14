"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const errorResponse = {
        error: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Ocorreu um erro interno no servidor.',
        details: err.details || [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    };
    return res.status(status).json(errorResponse);
}
