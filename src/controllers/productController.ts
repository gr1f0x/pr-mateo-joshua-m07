import { Request, Response } from "express";
import axios from "axios";
import Product from "../models/Product";

// Obtener 10 productos ordenados alfabéticamente
export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ name: 1 }).limit(10);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Buscar productos por nombre
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ message: "Se requiere un término de búsqueda" });
    }

    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    }).limit(10);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error al buscar productos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Obtener detalles de un producto
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Rellenar la base de datos con datos de una API externa
export const resetProducts = async (_req: Request, res: Response) => {
  try {
    // Eliminar todos los productos existentes
    await Product.deleteMany({});

    // Usar DummyJSON API que suele ser más confiable
    const response = await axios.get("https://dummyjson.com/products?limit=30");
    const productsData = response.data.products;

    // Transformar y guardar los productos
    const products = productsData.map((item: any) => ({
      name: item.title,
      price: parseFloat((Math.random() * 500 + 10).toFixed(2)), // Precio aleatorio entre 10 y 510
      description: item.description,
      imageUrl: item.thumbnail,
      additionalInfo: {
        category: item.category,
        brand: item.brand,
        rating: item.rating,
        stock: item.stock,
      },
    }));

    await Product.insertMany(products);

    res.status(200).json({
      message: "Base de datos de productos reiniciada correctamente",
      count: products.length,
    });
  } catch (error) {
    console.error("Error al resetear productos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
