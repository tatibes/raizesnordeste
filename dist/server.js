"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const prismaClient_1 = require("./database/prismaClient");
// Configuração para suportar serialização de BigInt em JSON (usado pelo Prisma com PostgreSQL)
BigInt.prototype.toJSON = function () {
    const num = Number(this);
    return Number.isSafeInteger(num) ? num : this.toString();
};
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Registro de rotas da aplicação
app.use(routes_1.default);
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
            }
            catch (e) {
                dbUrlMasked = 'Erro ao formatar URL (mascara aplicada por segurança)';
            }
        }
        // 2. Testar query simples no banco
        const rawResult = await prismaClient_1.prisma.$queryRaw `SELECT 1 as connection_test`;
        // 3. Contar registros das tabelas principais
        const unidadesCount = await prismaClient_1.prisma.unidade.count();
        const usuariosCount = await prismaClient_1.prisma.usuario.count();
        const produtosCount = await prismaClient_1.prisma.produto.count();
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
    }
    catch (error) {
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
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
//Middleware Global de Tratamento de Erros (Deve ficar SEMPRE no final das rotas)
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5432;
app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
    console.log(`Swagger UI disponível em http://localhost:${PORT}/api-docs`);
});
