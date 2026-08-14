import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;