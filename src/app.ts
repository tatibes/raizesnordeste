import express from 'express';
import swaggerUi from 'swagger-ui-express';
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

export default app;

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
