import { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import mongoose from "mongoose";

// Usamos un tipo más completo para el carrito
interface CartDocument {
  user: mongoose.Types.ObjectId | string;
  items: Array<{
    product: mongoose.Types.ObjectId | string;
    quantity: number;
    selected: boolean;
  }>;
  save: () => Promise<any>;
}

// Limpiar productos inexistentes del carrito sin devolver el objeto
const cleanupCartItems = async (cart: CartDocument): Promise<void> => {
  const validItems = [];
  let hasInvalidItems = false;

  for (const item of cart.items) {
    if (item.product) {
      validItems.push(item);
    } else {
      hasInvalidItems = true;
    }
  }

  if (hasInvalidItems) {
    cart.items = validItems;
    await cart.save();
    console.log(
      `Limpiados productos inexistentes del carrito para usuario ${cart.user}`
    );
  }
};

// Obtener el carrito del usuario
export const getCart = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    let cart = await Cart.findOne({ user: req.userId }).populate(
      "items.product"
    );

    if (!cart) {
      // Si el usuario no tiene carrito, se crea uno vacío
      cart = new Cart({
        user: req.userId,
        items: [],
      });
      await cart.save();
    } else {
      // Limpiar productos inexistentes
      await cleanupCartItems(cart);
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Añadir producto al carrito
export const addToCart = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const { productId } = req.body;

    // Validar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Buscar o crear el carrito del usuario
    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      cart = new Cart({
        user: req.userId,
        items: [],
      });
    }

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Si el producto ya está, aumentamos la cantidad
      cart.items[existingItemIndex].quantity += 1;
    } else {
      // Si no está, lo agregamos
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity: 1,
        selected: true,
      });
    }

    await cart.save();

    // Devolver el carrito actualizado con información de los productos
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Error al añadir al carrito:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Eliminar producto del carrito
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Filtrar para eliminar el producto
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    // Devolver el carrito actualizado
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Actualizar cantidad de un producto
export const updateQuantity = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    // Validar cantidad
    if (!quantity || quantity < 1) {
      return res
        .status(400)
        .json({ message: "La cantidad debe ser al menos 1" });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Encontrar el ítem a actualizar
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en el carrito" });
    }

    // Actualizar la cantidad
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Devolver el carrito actualizado
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Seleccionar/Deseleccionar producto
export const toggleSelect = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const { productId } = req.params;
    const { selected } = req.body;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Encontrar el ítem a actualizar
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en el carrito" });
    }

    // Actualizar el estado de selección
    cart.items[itemIndex].selected = selected;
    await cart.save();

    // Devolver el carrito actualizado
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Error al seleccionar/deseleccionar producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Confirmar compra de productos seleccionados
export const checkout = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Carrito no encontrado o vacío" });
    }

    // Filtrar los productos que no están seleccionados
    const selectedItems = cart.items.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      return res
        .status(400)
        .json({ message: "No hay productos seleccionados para la compra" });
    }

    // Eliminar los productos seleccionados del carrito
    cart.items = cart.items.filter((item) => !item.selected);
    await cart.save();

    // Devolver el carrito actualizado
    const updatedCart = await Cart.findById(cart._id).populate("items.product");

    res.status(200).json({
      message: "Compra realizada con éxito",
      cart: updatedCart,
      purchasedItems: selectedItems.length,
    });
  } catch (error) {
    console.error("Error al procesar la compra:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
