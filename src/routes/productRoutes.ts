import express from "express";
import {
  getProducts,
  searchProducts,
  getProductById,
  resetProducts,
} from "../controllers/productController";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

// Rutas públicas
router.get("/", getProducts);
router.get("/search", searchProducts);

// Rutas privadas
router.get("/:id", getProductById);

// Ruta protegida para reset de productos
router.post("/reset", authMiddleware, resetProducts);

export default router;
