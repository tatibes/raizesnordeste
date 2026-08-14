"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerJsdoc = require('swagger-jsdoc');
const app = (0, express_1.default)();
exports.default = app;
// Configurações do Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Minha API Node.js',
            version: '1.0.0',
            description: 'Documentação interativa da API',
        },
        servers: [{ url: 'http://localhost:3000' }],
    },
    // Caminho para os arquivos onde você vai documentar as rotas
    apis: ['./routes/*.js', './app.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
