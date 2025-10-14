import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";
import cartRoutes from "./routes/cart";
import adminRoutes from "./routes/admin";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);

console.log("✅ Đang khởi tạo server...");

// Đăng ký routes
app.use("/api/auth", authRoutes);
console.log("🚀 Đăng ký router: /api/auth");

app.use("/api/products", productRoutes);
console.log("🚀 Đăng ký router: /api/products");

app.use("/api/cart", cartRoutes);
console.log("🚀 Đăng ký router: /api/cart");

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("✅ Root route hoạt động (localhost:5000)!");
});

app.listen(PORT, () => console.log(`✅ Server chạy ở cổng ${PORT}`));
