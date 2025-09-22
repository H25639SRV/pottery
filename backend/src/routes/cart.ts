import { Router } from "express";
import { getCart, addToCart, checkout } from "../controllers/cartController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.post("/checkout", authMiddleware, checkout);

export default router;
