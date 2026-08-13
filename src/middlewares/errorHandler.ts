// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
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

