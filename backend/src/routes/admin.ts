import express from "express";
import {
  getAllUsers,
  getAllProducts,
  getAllCarts,
} from "../controllers/adminController";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/products", getAllProducts);
router.get("/carts", getAllCarts);

export default router;
