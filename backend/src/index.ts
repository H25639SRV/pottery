import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";

dotenv.config();

const app = express();

// ✅ Cấu hình CORS cho phép frontend truy cập
app.use(
  cors({
    origin: "http://localhost:3000", // Cho phép frontend gọi API
    credentials: true,
  })
);

// ✅ Cho phép parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Gắn route
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// ✅ Route gốc để test server
app.get("/", (req, res) => {
  res.send("🚀 Backend server is running successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at: http://localhost:${PORT}`);
});
