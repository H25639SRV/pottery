import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  checkoutCart,
} from "../controllers/cartController";

const router = express.Router();

// 🔑 THAY ĐỔI QUAN TRỌNG: Dùng POST để lấy giỏ hàng (tránh lỗi route params)
router.post("/get-cart", getCart);

router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.post("/checkout", checkoutCart);

export default router;
