// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const error = err instanceof Error ? err : new Error('Ocorreu um erro interno no servidor.');
  const status = typeof err === 'object' && err !== null && 'status' in err &&
    typeof err.status === 'number' ? err.status : 500;
  const code = typeof err === 'object' && err !== null && 'code' in err &&
    typeof err.code === 'string' ? err.code : 'INTERNAL_SERVER_ERROR';
  const errorResponse = {
    error: code,
    message: error.message,
    details: typeof err === 'object' && err !== null && 'details' in err ? err.details : [],
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  return res.status(status).json(errorResponse);
}
