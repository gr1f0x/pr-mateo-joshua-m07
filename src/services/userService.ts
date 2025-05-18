import { Types } from "mongoose";
import userRepository, { UserData } from "../repositories/userRepository";
import { generateAuthToken, generateRefreshToken } from "../utils/jwt";
import { validateUserData } from "../validators/userValidator";
import { IUser } from "../models/User";

interface ServiceResult<T = undefined> {
  success: boolean;
  errors?: Record<string, string>;
  data?: T;
}

export class UserService {
  async register(
    userData: UserData & { confirmPassword: string }
  ): Promise<ServiceResult> {
    // Validar datos
    const validation = validateUserData(userData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      return {
        success: false,
        errors: { email: "Este email ya está registrado" },
      };
    }

    // Crear usuario
    await userRepository.create(userData);

    return {
      success: true,
    };
  }

  async login(email: string, password: string): Promise<ServiceResult<any>> {
    // Validaciones básicas
    if (!email || !password) {
      return {
        success: false,
        errors: { message: "Email y contraseña son obligatorios" },
      };
    }

    // Buscar usuario
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return {
        success: false,
        errors: { message: "Credenciales inválidas" },
      };
    }

    // Validar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return {
        success: false,
        errors: { message: "Credenciales inválidas" },
      };
    }

    // Usar el id de forma segura
    const userId = user._id.toString();

    // Generar tokens
    const authToken = generateAuthToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Actualizar tokens en la base de datos
    await userRepository.updateTokens(userId, authToken, refreshToken);

    return {
      success: true,
      data: {
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        authToken,
        refreshToken,
      },
    };
  }

  async logout(userId: string): Promise<ServiceResult> {
    if (!userId) {
      return {
        success: false,
        errors: { message: "No autorizado" },
      };
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        errors: { message: "Usuario no encontrado" },
      };
    }

    await userRepository.clearTokens(userId);

    return {
      success: true,
    };
  }
}

export default new UserService();
