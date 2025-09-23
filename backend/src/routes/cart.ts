// src/routes/cart.ts
import { Router } from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
} from "../controllers/cartController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.delete("/:itemId", authMiddleware, removeFromCart);

export default router;
