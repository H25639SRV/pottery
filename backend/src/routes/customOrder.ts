import express from "express";
import { createCustomRequest } from "../controllers/customOrderController";
import { authMiddleware } from "../middleware/authMiddleware"; // Chỉ cần xác thực

const router = express.Router();

// Khách hàng cần đăng nhập để gửi yêu cầu
// POST /api/custom-request/
router.post("/custom-request", authMiddleware, createCustomRequest);
export default router;
