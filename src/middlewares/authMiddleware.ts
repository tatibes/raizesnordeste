import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

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

  const token = authHeader.split(' ')[1];
  const parts = token.split('.');

  if (parts.length !== 3) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de autenticação inválido.'
    });
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET não configurado.');
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Configuração de autenticação ausente.'
      });
    }
    
    // Validar assinatura (HMAC SHA256)
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${headerB64}.${payloadB64}`);
    const expectedSignature = hmac.digest('base64url');

    const cleanSignature = signatureB64.replace(/=/g, '');

    if (
      cleanSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(cleanSignature))
    ) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Assinatura do token inválida.'
      });
    }

    // Decodificar payload
    const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson) as TokenPayload;

    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Token de autenticação expirado.'
      });
    }

    req.user = {
      id: Number(payload.id),
      perfil: payload.perfil
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de autenticação inválido ou expirado.'
    });
  }
}
