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
// Render usa PORT=10000 por defecto, pero respetamos cualquier valor configurado
const PORT = parseInt(process.env.PORT || "10000", 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Ruta de prueba
app.get("/", (_req, res) => {
  res.send("API de ecommerce funcionando correctamente");
});

// Conectar a la base de datos y luego iniciar el servidor
console.log("Intentando conectar a MongoDB...");
connectDB()
  .then(() => {
    // Iniciar servidor escuchando en todas las interfaces (0.0.0.0) como requiere Render
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Servidor escuchando en http://0.0.0.0:${PORT} (Render compatible)`);
    });

    // Manejar errores de inicio del servidor
    server.on("error", (err) => {
      console.error("❌ Error al iniciar el servidor:", err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err);
    process.exit(1);
  });

// Manejar cierre de aplicación
process.on("SIGINT", async () => {
  // Cerrar conexión a la base de datos
  await import("./config/database").then((db) => db.disconnectDB());
  process.exit(0);
});
