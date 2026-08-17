"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const crypto_1 = __importDefault(require("crypto"));
function authMiddleware(req, res, next) {
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
        const secret = process.env.JWT_SECRET || '77256de1-6faa-4dc0-a481-eb93fac29c39';
        // Validar assinatura (HMAC SHA256)
        const hmac = crypto_1.default.createHmac('sha256', secret);
        hmac.update(`${headerB64}.${payloadB64}`);
        const expectedSignature = hmac.digest('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        const cleanSignature = signatureB64.replace(/=/g, '');
        if (expectedSignature !== cleanSignature) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Assinatura do token inválida.'
            });
        }
        // Decodificar payload
        const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        req.user = {
            id: Number(payload.id),
            perfil: payload.perfil
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            error: 'UNAUTHORIZED',
            message: 'Token de autenticação inválido ou expirado.'
        });
    }
}
