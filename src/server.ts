import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

// 1. Endpoint de teste / Health Check
app.get('/health', (req, res) => {
  return res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 2. REGISTRO DA ROTA DO SWAGGER
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 3. Middleware Global de Tratamento de Erros (Deve ficar SEMPRE no final das rotas)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor a rodar na porta ${PORT}`);
  console.log(`📄 Swagger UI disponível em http://localhost:${PORT}/api-docs`);
});

import routes from './routes';


