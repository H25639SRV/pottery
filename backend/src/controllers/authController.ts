import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO users(email, password) VALUES($1, $2)", [
    email,
    hashed,
  ]);
  res.json({ message: "Đăng ký thành công" });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  const user = result.rows[0];
  if (!user) return res.status(400).json({ error: "Sai tài khoản" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Sai mật khẩu" });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1h" }
  );

  res.json({ id: user.id, email: user.email, token });
};
