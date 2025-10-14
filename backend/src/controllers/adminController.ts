// src/controllers/adminController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        // theo schema bạn có carts: Cart[]
        carts: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
    });
    res.json(users);
  } catch (err: any) {
    console.error("❌ getAllUsers error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err: any) {
    console.error("❌ getAllProducts error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const getAllCarts = async (req: Request, res: Response) => {
  try {
    const carts = await prisma.cart.findMany({
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });
    res.json(carts);
  } catch (err: any) {
    console.error("❌ getAllCarts error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};
