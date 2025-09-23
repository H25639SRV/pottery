// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "No authorization header" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ error: "Invalid authorization format" });

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    if (!decoded || typeof decoded.id !== "number") {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // gán user id lên req.user
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
