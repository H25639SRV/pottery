import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";

// 🧩 Import routes
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";
import cartRoutes from "./routes/cart";
import adminRoutes from "./routes/admin";
import renderRoutes from "./routes/render";
import chatRoutes from "./routes/chat";

// 🧠 Socket
import { initChatSocket } from "./socket/chatSocket";

// ===========================
// ⚙️ Cấu hình môi trường
// ===========================
dotenv.config();

// ===========================
// 🚀 Khởi tạo ứng dụng Express
// ===========================
const app = express();

console.log("✅ Khởi tạo server Mộc Gốm...");

// ===========================
// 🧩 Middleware cơ bản
// ===========================
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// 🖼️ Phục vụ file tĩnh
// ===========================
// 📂 Public (ảnh, uploads, render)
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use(
  "/render_output",
  express.static(path.join(process.cwd(), "public/render_output"))
);
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// 📂 Assets trong src (mẫu gốm gốc)
app.use("/render", express.static(path.join(process.cwd(), "src/assets")));

// ===========================
// 🔗 Đăng ký các API routes
// ===========================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/render", renderRoutes);
app.use("/api/chat", chatRoutes);

// ===========================
// ✅ Kiểm tra hoạt động
// ===========================
app.get("/", (req: Request, res: Response) => {
  res.send("✅ Backend Mộc Gốm đang hoạt động tại cổng 5000");
});

// ===========================
// ⚙️ HTTP + Socket.IO
// ===========================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 🔊 Khởi tạo socket chat
initChatSocket(io);

// ===========================
// 🚀 Khởi động server
// ===========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server Mộc Gốm đang chạy ở cổng ${PORT}`);
  console.log(`🌐 Truy cập: http://localhost:${PORT}`);
});

// ===========================
// ⚠️ Xử lý lỗi toàn cục
// ===========================
process.on("uncaughtException", (err: unknown) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason: any) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend server is running 🚀",
    timestamp: new Date(),
  });
});
