"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedidoRoutes = void 0;
const express_1 = require("express");
const PedidoController_1 = require("../controllers/PedidoController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const pedidoRoutes = (0, express_1.Router)();
exports.pedidoRoutes = pedidoRoutes;
const controller = new PedidoController_1.PedidoController();
// Exige autenticação JWT
pedidoRoutes.post('/pedidos', authMiddleware_1.authMiddleware, controller.criarPedido);
