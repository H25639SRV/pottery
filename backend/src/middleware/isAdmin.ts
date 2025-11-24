import { Request, Response, NextFunction } from "express";

// Middleware này PHẢI chạy SAU authMiddleware
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Lấy role từ request (đã được gán bởi authMiddleware)
  const role = (req as any).role;

  if (role && role === "ADMIN") {
    next(); // Là Admin, cho phép đi tiếp
  } else {
    // Không phải admin hoặc không có role
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
};
