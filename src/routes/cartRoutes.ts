import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  toggleSelect,
  checkout,
} from "../controllers/cartController";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

// Todas las rutas del carrito requieren autenticación
router.use(authMiddleware);

router.get("/", getCart);
router.post("/add", addToCart);
router.delete("/:productId", removeFromCart);
router.put("/:productId/quantity", updateQuantity);
router.put("/:productId/select", toggleSelect);
router.post("/checkout", checkout);

export default router;
