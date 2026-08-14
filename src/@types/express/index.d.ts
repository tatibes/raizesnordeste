import { TokenPayload } from '../../middlewares/authMiddleware'; // ajuste a importação se necessário

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number | bigint;
        perfil?: string;
      };
    }
  }
}