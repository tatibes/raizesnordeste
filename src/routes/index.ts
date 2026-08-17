import { Router } from 'express';
import { pedidoRoutes } from './pedido.routes';
import produtoRoutes from '../controllers/ProdutoControlle';

const routes = Router();

routes.use(pedidoRoutes);
routes.use(produtoRoutes);

export default routes;
