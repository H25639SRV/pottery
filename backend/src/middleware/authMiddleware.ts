import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET || "secret";
    const decoded = jwt.verify(token, secret) as { id: number; email: string };
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
};
