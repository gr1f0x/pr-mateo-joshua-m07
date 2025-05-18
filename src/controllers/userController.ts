import { Request, Response } from "express";
import userService from "../services/userService";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await userService.register(req.body);

    if (!result.success && result.errors) {
      const firstError = Object.values(result.errors)[0];
      return res
        .status(400)
        .json({ message: firstError || "Error en el registro" });
    }

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);

    if (!result.success) {
      const errorMessage = result.errors?.message || "Error de autenticación";
      return res.status(401).json({ message: errorMessage });
    }

    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Aseguramos que userId existe
    const userId = req.userId || "";

    const result = await userService.logout(userId);

    if (!result.success) {
      const errorMessage = result.errors?.message || "Error al cerrar sesión";
      return res.status(401).json({ message: errorMessage });
    }

    res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
