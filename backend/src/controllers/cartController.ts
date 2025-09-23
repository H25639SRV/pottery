// src/controllers/cartController.ts
import { Request, Response } from "express";
import * as cartService from "../services/cartService";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const cart = await cartService.getCartByUser(userId);
    res.json(cart || { items: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { productId, quantity } = req.body;
    if (!productId || !quantity)
      return res.status(400).json({ error: "productId and quantity required" });

    const item = await cartService.addOrUpdateCartItem(
      userId,
      Number(productId),
      Number(quantity)
    );
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    if (!itemId) return res.status(400).json({ error: "itemId required" });

    await cartService.removeCartItem(Number(itemId));
    res.json({ message: "Item removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove item" });
  }
};
