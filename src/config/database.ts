import mongoose from "mongoose";
import dotenv from "dotenv";

// Asegurarse de que dotenv está configurado
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

export const connectDB = async (): Promise<void> => {
  try {
    // Usar más opciones para mejorar la conexión
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Aumentar el tiempo de espera de selección del servidor a 30 segundos
    });
    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB desconectado correctamente");
  } catch (error) {
    console.error("Error al desconectar de MongoDB:", error);
  }
};
