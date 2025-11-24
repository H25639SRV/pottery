import express from "express";

// Controllers cũ
import {
  getAllUsers,
  getAllProducts,
  getAllCarts,
} from "../controllers/adminController";

// Controllers mới
import {
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import {
  getAllCustomRequests,
  updateCustomRequestStatus,
} from "../controllers/customOrderController";

// Middlewares
import { authMiddleware } from "../middleware/authMiddleware"; // Import hàm đã sửa
import { isAdmin } from "../middleware/isAdmin"; // Import hàm đã sửa

const router = express.Router();

// [QUAN TRỌNG] Áp dụng middleware cho TẤT CẢ các route trong file này
// 1. Yêu cầu token hợp lệ (authMiddleware)
// 2. Yêu cầu role phải là "ADMIN" (isAdmin)
router.use(authMiddleware);
router.use(isAdmin);

// --- Routes cũ (giờ đã được bảo vệ) ---
router.get("/users", getAllUsers);
router.get("/products", getAllProducts);
router.get("/carts", getAllCarts);

// --- Routes mới cho Admin ---

// Routes cho Đơn hàng (Order)
// GET /api/admin/orders
router.get("/orders", getAllOrders);
// PATCH /api/admin/orders/:orderId/status
router.patch("/orders/:orderId/status", updateOrderStatus);

// Routes cho Yêu cầu Custom (CustomOrderRequest)
// GET /api/admin/custom-requests
router.get("/custom-requests", getAllCustomRequests);
// PATCH /api/admin/custom-requests/:requestId/status
router.patch("/custom-requests/:requestId/status", updateCustomRequestStatus);

export default router;
