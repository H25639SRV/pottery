import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// ✅ Admin routes
router.post("/", authenticateToken, checkAdminRole, createProduct);
router.put("/:id", authenticateToken, checkAdminRole, updateProduct);
router.delete("/:id", authenticateToken, checkAdminRole, deleteProduct);

function checkAdminRole(req: any, res: any, next: any) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Bạn không có quyền ADMIN" });
  }
  next();
}

export default router;
