// Cargar dotenv primero antes de importar cualquier otro módulo que pueda usar variables de entorno
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/database";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";

// Configuración
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos
console.log("Intentando conectar a MongoDB en:", process.env.MONGO_URI);
connectDB()
  .then(() => {
    // Rutas
    app.use("/api/users", userRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/cart", cartRoutes);

    // Ruta de prueba
    app.get("/", (_req, res) => {
      res.send("API de ecommerce funcionando correctamente");
    });

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "No se pudo iniciar la aplicación debido a un error de conexión a MongoDB:",
      err
    );
    process.exit(1);
  });

// Manejar cierre de aplicación
process.on("SIGINT", async () => {
  // Cerrar conexión a la base de datos
  await import("./config/database").then((db) => db.disconnectDB());
  process.exit(0);
});
