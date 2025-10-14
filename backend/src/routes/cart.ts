import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  checkoutCart,
} from "../controllers/cartController";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.post("/checkout", checkoutCart);

export default router;
