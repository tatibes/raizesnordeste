// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Lógica de validação do token JWT...
  next();
}