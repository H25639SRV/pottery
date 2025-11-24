import express from "express";
import { createOrder } from "../controllers/orderController"; // Import hàm createOrder
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Route cho USER tạo đơn hàng (Có gửi Address & PaymentMethod)
// API: POST /api/orders
router.post("/", authMiddleware, createOrder);

export default router;
