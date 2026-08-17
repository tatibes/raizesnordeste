"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pedido_routes_1 = require("./pedido.routes");
const ProdutoControlle_1 = __importDefault(require("../controllers/ProdutoControlle"));
const routes = (0, express_1.Router)();
routes.use(pedido_routes_1.pedidoRoutes);
routes.use(ProdutoControlle_1.default);
exports.default = routes;
