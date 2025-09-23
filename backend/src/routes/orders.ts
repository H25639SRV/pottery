// src/routes/orders.ts
import { Router } from "express";
import { checkout, getOrders } from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/checkout", authMiddleware, checkout);
router.get("/", authMiddleware, getOrders);

export default router;
