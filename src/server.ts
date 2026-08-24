import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { prisma } from './database/prismaClient';

// Configuração para suportar serialização de BigInt em JSON (usado pelo Prisma com PostgreSQL)
(BigInt.prototype as any).toJSON = function () {
  const num = Number(this);
  return Number.isSafeInteger(num) ? num : this.toString();
};

dotenv.config();

const app = express();

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

// Registro de rotas da aplicação
app.use(routes);

//Endpoint de teste / Health Check
app.get('/health', (req, res) => {
  return res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint para diagnóstico do banco de dados (ajuda a identificar problemas de conexão no servidor externo)
app.get('/debug-db', async (req, res) => {
  try {
    // 1. Verificar se a variável de ambiente está definida (sem vazar a string completa)
    const dbUrl = process.env.DATABASE_URL;
    let dbUrlStatus = 'Não configurada';
    let dbUrlMasked = '';
    
    if (dbUrl) {
      dbUrlStatus = 'Configurada';
      try {
        const urlObj = new URL(dbUrl.replace('postgres://', 'http://').replace('postgresql://', 'http://'));
        dbUrlMasked = `${urlObj.protocol}//***:***@${urlObj.host}${urlObj.pathname}${urlObj.search}`;
      } catch (e) {
        dbUrlMasked = 'Erro ao formatar URL (mascara aplicada por segurança)';
      }
    }

    // 2. Testar query simples no banco
    const rawResult = await prisma.$queryRaw`SELECT 1 as connection_test`;

    // 3. Contar registros das tabelas principais
    const unidadesCount = await prisma.unidade.count();
    const usuariosCount = await prisma.usuario.count();
    const produtosCount = await prisma.produto.count();

    return res.json({
      status: 'success',
      database_url: {
        status: dbUrlStatus,
        masked: dbUrlMasked
      },
      connection: 'established',
      query_test: rawResult,
      counts: {
        unidades: unidadesCount,
        usuarios: usuariosCount,
        produtos: produtosCount
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Erro desconhecido',
      code: error.code || 'N/A',
      meta: error.meta || null,
      database_url_configured: !!process.env.DATABASE_URL
    });
  }
});

//REGISTRO DA ROTA DO SWAGGER
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Middleware Global de Tratamento de Erros (Deve ficar SEMPRE no final das rotas)
app.use(errorHandler);

const PORT = process.env.PORT || 5432;

app.listen(PORT, () => {
  console.log(`Servidor a rodar na porta ${PORT}`);
  console.log(`Swagger UI disponível em http://localhost:${PORT}/api-docs`);
});


