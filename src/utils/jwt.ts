import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret";

interface TokenPayload {
  userId: string;
}

export const generateAuthToken = (userId: string | Types.ObjectId): string => {
  // Asegurarse de que userId sea una string
  const id = userId.toString();
  return jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: "5m" });
};

export const generateRefreshToken = (
  userId: string | Types.ObjectId
): string => {
  // Asegurarse de que userId sea una string
  const id = userId.toString();
  return jwt.sign({ userId: id }, JWT_REFRESH_SECRET, { expiresIn: "24h" });
};

export const verifyAuthToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
