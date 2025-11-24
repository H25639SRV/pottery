import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Payload của token
interface JwtPayload {
  id: number;
  role: string;
}

// Hàm middleware chính (Tên mới)
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // --- [SỬA LỖI TẠI ĐÂY] ---
  // Bỏ qua tất cả các yêu cầu OPTIONS (yêu cầu Preflight)
  if (req.method === "OPTIONS") {
    return next();
  }
  // --- [KẾT THÚC SỬA LỖI] ---

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // Nếu không có token, trả về 401
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // ✅ Gắn userId và role vào request
    (req as any).userId = decoded.id;
    (req as any).role = decoded.role;

    // Hỗ trợ legacy code (nếu code cũ dùng req.user)
    (req as any).user = decoded;

    next();
  } catch (error) {
    // Nếu token hết hạn hoặc không hợp lệ, trả về 403
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ QUAN TRỌNG: Xuất thêm tên cũ 'authenticateToken' làm alias
export const authenticateToken = authMiddleware;
