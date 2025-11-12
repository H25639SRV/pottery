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

// Import socket
import { initChatSocket } from "./socket/chatSocket";

dotenv.config();

const app = express();
console.log("✅ Khởi tạo server Mộc Gốm...");

// Lấy danh sách các URL được phép từ biến môi trường
// Ví dụ: CLIENT_URL=https://netlify-domain.app,https://abcd1234.ngrok.io,http://localhost:3000
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:3000"
).split(",");

// --- CẤU HÌNH CORS CHO HTTP ---
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
app.use(
  "/render_output",
  express.static(path.join(process.cwd(), "public/render_output"))
);
app.use("/render", express.static(path.join(process.cwd(), "src/assets")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/render", renderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chatbot", chatbotRoute);

// Test
app.get("/", (req: Request, res: Response) => {
  res.send("✅ Backend Mộc Gốm đang hoạt động tại cổng 5000");
});

// HTTP + Socket
const server = http.createServer(app);

// --- CẤU HÌNH CORS CHO SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Sử dụng cùng danh sách origin cho Socket.io
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket init
initChatSocket(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server Mộc Gốm đang chạy ở cổng ${PORT}`);
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend server is running 🚀",
    timestamp: new Date(),
  });
});
