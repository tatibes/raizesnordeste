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
// Solução para serialização de BigInt no Express/JSON
BigInt.prototype.toJSON = function () {
    const num = Number(this);
    return Number.isSafeInteger(num) ? num : this.toString();
};
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 1. Endpoint de teste / Health Check
app.get('/health', (req, res) => {
    return res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// 2. REGISTRO DA ROTA DO SWAGGER
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
// REGISTRO DAS ROTAS DA API
app.use(routes_1.default);
// 3. Middleware Global de Tratamento de Erros (Deve ficar SEMPRE no final das rotas)
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor a rodar na porta ${PORT}`);
    console.log(`📄 Swagger UI disponível em http://localhost:${PORT}/api-docs`);
});
