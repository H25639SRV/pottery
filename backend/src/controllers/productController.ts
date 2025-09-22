import { Request, Response } from "express";
import { pool } from "../db";

export const getProducts = async (_req: Request, res: Response) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
};

export const addProduct = async (req: Request, res: Response) => {
  const { name, price, image_url, description } = req.body;
  const result = await pool.query(
    "INSERT INTO products(name, price, image_url, description) VALUES($1,$2,$3,$4) RETURNING *",
    [name, price, image_url, description]
  );
  res.json(result.rows[0]);
};
