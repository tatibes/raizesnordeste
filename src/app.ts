import express from 'express';
import swaggerUi from 'swagger-ui-express';
// Use require to load JSON without needing additional TypeScript config
// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerDocument: any = require('./swagger.json');

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;