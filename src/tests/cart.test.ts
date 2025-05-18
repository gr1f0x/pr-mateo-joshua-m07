import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import Cart from "../models/Cart";
import User from "../models/User";
import Product from "../models/Product";
import cartRoutes from "../routes/cartRoutes";

// Mocks necesarios
jest.mock("../middlewares/auth", () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.userId = "test-user-id";
    next();
  },
}));

// Crear servidor express para testing
const app = express();
app.use(express.json());
app.use("/api/cart", cartRoutes);

let mongoServer: MongoMemoryServer;

// Setup de base de datos
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

// Limpiar datos después de cada test
beforeEach(async () => {
  await Cart.deleteMany({});
  await User.deleteMany({});
  await Product.deleteMany({});
});

// Cerrar conexiones después de todos los tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Cart Controller Tests", () => {
  // Test para obtener carrito
  test("GET /api/cart debe retornar un carrito vacío si no existe", async () => {
    // Crear usuario
    await User.create({
      _id: "test-user-id",
      email: "test@example.com",
      password: "Password123",
      firstName: "Test",
      lastName: "User",
      address: "Test Address",
    });

    const response = await request(app).get("/api/cart");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("items");
    expect(response.body.items).toEqual([]);
  });

  // Test para añadir producto al carrito
  test("POST /api/cart/add debe añadir un producto al carrito", async () => {
    // Crear usuario y producto
    await User.create({
      _id: "test-user-id",
      email: "test@example.com",
      password: "Password123",
      firstName: "Test",
      lastName: "User",
      address: "Test Address",
    });

    const product = await Product.create({
      name: "Test Product",
      price: 19.99,
      description: "A test product",
      imageUrl: "http://example.com/image.jpg",
    });

    const response = await request(app)
      .post("/api/cart/add")
      .send({ productId: product._id });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items[0].quantity).toBe(1);
  });

  // Test para eliminar producto del carrito
  test("DELETE /api/cart/:productId debe eliminar un producto del carrito", async () => {
    // Crear usuario y producto
    await User.create({
      _id: "test-user-id",
      email: "test@example.com",
      password: "Password123",
      firstName: "Test",
      lastName: "User",
      address: "Test Address",
    });

    const product = await Product.create({
      name: "Test Product",
      price: 19.99,
      description: "A test product",
      imageUrl: "http://example.com/image.jpg",
    });

    // Crear carrito con un producto
    await Cart.create({
      user: "test-user-id",
      items: [
        {
          product: product._id,
          quantity: 1,
          selected: true,
        },
      ],
    });

    const response = await request(app).delete(`/api/cart/${product._id}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(0);
  });
});
