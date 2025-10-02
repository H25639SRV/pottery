// src/types/express.d.ts
import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      // nếu token payload chỉ có id: { id: number }, bạn có thể thay User | { id: number }
      user?: { id: number } | User;
    }
  }
}
