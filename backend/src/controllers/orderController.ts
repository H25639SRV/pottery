// src/controllers/orderController.ts
import { Request, Response } from "express";
import * as orderService from "../services/orderService";

export const checkout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const order = await orderService.createOrderFromCart(userId);
    res.json(order);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message || "Checkout failed" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const orders = await orderService.getOrdersByUser(userId);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
