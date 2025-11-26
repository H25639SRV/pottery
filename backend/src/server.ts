import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";

// Import routes
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";
import cartRoutes from "./routes/cart";
import adminRoutes from "./routes/admin";
import renderRoutes from "./routes/render";
import chatRoutes from "./routes/chat";
import chatbotRoute from "./routes/chatbot";
import customOrderRoutes from "./routes/customOrder";
import categoryRoutes from "./routes/category";
import orderRoutes from "./routes/order";

// Import socket
import { initChatSocket } from "./socket/chatSocket";

// Tải biến môi trường từ file .env
dotenv.config();

const app = express();

console.log("✅ Khởi tạo server Mộc Gốm...");

// --- CẤU HÌNH CÁC ORIGIN ĐƯỢC PHÉP TRUY CẬP (CORS) ---

// Sẽ ưu tiên lấy từ biến môi trường CLIENT_URL. Nếu không có, sẽ sử dụng URL Vercel của bạn.
const clientUrlString =
  process.env.CLIENT_URL || 
  "http://localhost:3000,https://mocgom-m0blw53a9-h25639srvs-projects.vercel.app";

const allowedOrigins = clientUrlString
  .split(",")
  .map((url) => url.trim())
  .filter((url) => url);

// --- CẤU HÌNH MIDDLEWARE ---

// Cấu hình CORS cho ứng dụng Express
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Cho phép truyền cookie/header Authorization
  })
);

// Tăng giới hạn body size lên 50MB để nhận ảnh Base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cấu hình Static files
const rootDir = process.cwd();

app.use("/public", express.static(path.join(rootDir, "public")));
app.use("/uploads", express.static(path.join(rootDir, "public/uploads")));
app.use(
  "/render_output",
  express.static(path.join(rootDir, "public/render_output"))
);
app.use("/render", express.static(path.join(rootDir, "src/assets")));

// --- CẤU HÌNH ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/render", renderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chatbot", chatbotRoute);
app.use("/api", customOrderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

// Test Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend server is running 🚀",
    timestamp: new Date(),
    allowed_origins: allowedOrigins, // Hiển thị các domain được phép
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("✅ Backend Mộc Gốm đang hoạt động");
});


// --- KHỞI TẠO HTTP SERVER VÀ SOCKET.IO ---
const server = http.createServer(app);

// Cấu hình CORS riêng cho Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initChatSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server Mộc Gốm đang chạy ở cổng ${PORT}`);
  console.log(`Allowed Origins: ${allowedOrigins.join(", ")}`);
});