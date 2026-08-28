import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload {
  id: number;
  perfil?: string;
  nome?: string;
  email?: string;
  exp?: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de autenticação não fornecido ou inválido.'
    });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET não configurado.');
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Configuração de autenticação ausente.'
    });
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload & TokenPayload;

    if (!payload || typeof payload.id === 'undefined') {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Token de autenticação inválido.'
      });
    }

    req.user = {
      id: Number(payload.id),
      perfil: typeof payload.perfil === 'string' ? payload.perfil : undefined
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de autenticação inválido ou expirado.'
    });
  }
}
