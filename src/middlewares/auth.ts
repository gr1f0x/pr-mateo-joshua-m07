import { Request, Response, NextFunction } from "express";
import {
  verifyAuthToken,
  verifyRefreshToken,
  generateAuthToken,
  generateRefreshToken,
} from "../utils/jwt";
import userRepository from "../repositories/userRepository";

// Extender la interfaz Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken = req.headers.authorization?.split(" ")[1];
    const refreshToken = req.headers["refresh-token"] as string;

    if (!authToken || !refreshToken) {
      return res.status(401).json({ message: "Autenticación requerida" });
    }

    // Intentar verificar el token de autenticación primero
    const authPayload = verifyAuthToken(authToken);
    if (authPayload) {
      // Token de autenticación válido, procesamos normalmente
      req.userId = authPayload.userId;
      return next();
    }

    // Token de autenticación inválido, intentar con token de refresco
    const refreshPayload = verifyRefreshToken(refreshToken);
    if (!refreshPayload) {
      return res.status(401).json({
        message: "Sesión expirada, por favor inicie sesión de nuevo",
      });
    }

    const userId = refreshPayload.userId;

    // Verificar que el token de refresco coincida con el almacenado en la BBDD
    const isValidRefreshToken = await userRepository.checkRefreshTokenMatch(
      userId,
      refreshToken
    );
    if (!isValidRefreshToken) {
      return res.status(401).json({ message: "Token de refresco inválido" });
    }

    // Token de refresco válido, generar nuevos tokens
    const newAuthToken = generateAuthToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    // Actualizar tokens en la base de datos
    await userRepository.updateTokens(userId, newAuthToken, newRefreshToken);

    // Establecer nuevos tokens en headers de respuesta para el cliente
    res.setHeader("Authorization", `Bearer ${newAuthToken}`);
    res.setHeader("Refresh-Token", newRefreshToken);

    // Continuar con la petición
    req.userId = userId;
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
