import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Lấy danh sách sản phẩm
export const getProducts = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

// Lấy sản phẩm theo ID
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// Tạo mới sản phẩm (admin)
export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, image } = req.body;
  const newProduct = await prisma.product.create({
    data: { name, description, price: parseFloat(price), image },
  });
  res.status(201).json(newProduct);
};

// Cập nhật sản phẩm (admin)
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;
  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data: { name, description, price: parseFloat(price), image },
  });
  res.json(updated);
};

// Xoá sản phẩm (admin)
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id: Number(id) } });
  res.json({ message: "Product deleted successfully" });
};
