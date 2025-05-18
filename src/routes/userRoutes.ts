import express from "express";
import { register, login, logout } from "../controllers/userController";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Rutas protegidas
router.post("/logout", authMiddleware, logout);

export default router;
