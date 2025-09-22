import { Response } from "express";
import { pool } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getCart = async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    "SELECT c.id, p.name, p.price, c.quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id=$1",
    [req.user?.id]
  );
  res.json(result.rows);
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  const { product_id, quantity } = req.body;
  const result = await pool.query(
    "INSERT INTO cart(user_id, product_id, quantity) VALUES($1,$2,$3) RETURNING *",
    [req.user?.id, product_id, quantity]
  );
  res.json(result.rows[0]);
};

export const checkout = async (req: AuthRequest, res: Response) => {
  await pool.query("DELETE FROM cart WHERE user_id=$1", [req.user?.id]);
  res.json({ message: "Thanh toán thành công!" });
};
