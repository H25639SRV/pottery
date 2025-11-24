import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { getGeminiReply } from "../services/chatbotService"; // Đảm bảo đường dẫn đúng

const prisma = new PrismaClient();

interface ChatMessage {
  sender: string;
  text: string;
  roomId: string;
  role: "admin" | "guest" | "bot";
  createdAt?: string;
}

interface RoomInfo {
  id: string;
  guestName: string;
}

// Bộ nhớ tạm để Admin biết phòng nào đang Active (Online)
const activeRooms: RoomInfo[] = [];

export function initChatSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Client connected: ${socket.id}`);

    // ===========================================
    // 1. GUEST JOIN (Xử lý Logic kết nối lại)
    // ===========================================
    socket.on(
      "join-guest",
      async (payload: { username: string; roomId?: string }) => {
        let roomId = payload.roomId;
        const username = payload.username || "Khách";

        // Nếu không có roomId cũ (hoặc null), tạo mới
        if (!roomId) {
          roomId = `room-${username}-${Date.now()}`;
        }

        // Join socket vào phòng
        socket.join(roomId);

        // Gửi lại roomId để frontend lưu vào localStorage
        socket.emit("room-created", { roomId });

        // Thêm vào danh sách Active nếu chưa có
        if (!activeRooms.find((r) => r.id === roomId)) {
          activeRooms.push({ id: roomId!, guestName: username });
          io.to("admin-room").emit("active-rooms", activeRooms);
        }

        console.log(`🧑‍🍳 Guest ${username} joined room ${roomId}`);

        // 🔥 QUAN TRỌNG: Lấy lịch sử chat từ Database trả về cho Guest
        try {
          const history = await prisma.message.findMany({
            where: { roomId: roomId },
            orderBy: { createdAt: "asc" },
          });

          // Format lại dữ liệu cho khớp interface Frontend
          const formattedHistory: ChatMessage[] = history.map((msg) => ({
            sender: msg.sender,
            text: msg.text,
            roomId: msg.roomId,
            role: msg.role as "admin" | "guest" | "bot",
            createdAt: msg.createdAt.toISOString(),
          }));

          socket.emit("chat-history", formattedHistory);
        } catch (err) {
          console.error("❌ Lỗi lấy lịch sử chat:", err);
        }
      }
    );

    // ===========================================
    // 2. ADMIN JOIN
    // ===========================================

    // Admin join phòng tổng quản lý
    socket.on("join-admin", () => {
      socket.join("admin-room");
      console.log(`🛠️ Admin ${socket.id} joined admin-room`);
      socket.emit("active-rooms", activeRooms);
    });

    // Admin join vào một phòng chat cụ thể để xem và chat
    socket.on("join-room-admin", async (roomId: string) => {
      socket.join(roomId);
      console.log(`👩‍💼 Admin joined room ${roomId}`);

      try {
        // Lấy lịch sử từ DB
        const history = await prisma.message.findMany({
          where: { roomId: roomId },
          orderBy: { createdAt: "asc" },
        });

        const formattedHistory: ChatMessage[] = history.map((msg) => ({
          sender: msg.sender,
          text: msg.text,
          roomId: msg.roomId,
          role: msg.role as "admin" | "guest" | "bot",
          createdAt: msg.createdAt.toISOString(),
        }));

        socket.emit("chat-history", formattedHistory);
      } catch (error) {
        console.error("❌ Lỗi lấy lịch sử chat cho Admin:", error);
        socket.emit("chat-history", []);
      }
    });

    socket.on("request-active-rooms", () => {
      socket.emit("active-rooms", activeRooms);
    });

    // ===========================================
    // 3. XỬ LÝ TIN NHẮN & BOT
    // ===========================================
    socket.on(
      "chat-message",
      async (msg: {
        sender: string;
        text: string;
        roomId: string;
        role: "guest" | "admin";
      }) => {
        // 1. Gửi realtime cho người khác trong phòng (trừ người gửi)
        const chatMsg: ChatMessage = {
          sender: msg.sender,
          text: msg.text,
          roomId: msg.roomId,
          role: msg.role,
          createdAt: new Date().toISOString(),
        };

        socket.to(msg.roomId).emit("chat-message", chatMsg);
        io.to("admin-room").emit("new-message-in-room", {
          roomId: msg.roomId,
          preview: msg.text,
        });

        // 2. Lưu vào Database (Bất đồng bộ)
        try {
          await prisma.message.create({
            data: {
              sender: msg.sender,
              text: msg.text,
              roomId: msg.roomId,
              role: msg.role,
            },
          });
        } catch (err) {
          console.error("❌ Lỗi lưu tin nhắn:", err);
        }

        // 3. Logic Bot trả lời (Chỉ khi Guest nhắn và không có Admin trong phòng)
        if (msg.role === "guest") {
          const room = io.sockets.adapter.rooms.get(msg.roomId);
          // Check xem có socket nào trong phòng này đang join 'admin-room' không
          const hasAdmin =
            room &&
            Array.from(room).some((id) => {
              const s = io.sockets.sockets.get(id);
              return s?.rooms.has("admin-room");
            });

          if (!hasAdmin) {
            try {
              const replyText = await getGeminiReply(msg.text);
              const botMsg: ChatMessage = {
                sender: "Bot",
                text: replyText,
                roomId: msg.roomId,
                role: "bot",
                createdAt: new Date().toISOString(),
              };

              // Gửi socket
              io.to(msg.roomId).emit("chat-message", botMsg);
              io.to("admin-room").emit("new-message-in-room", {
                roomId: msg.roomId,
                preview: botMsg.text,
              });

              // Lưu bot reply
              await prisma.message.create({
                data: {
                  sender: "Bot",
                  text: replyText,
                  roomId: msg.roomId,
                  role: "bot",
                },
              });
            } catch (err) {
              console.error("🤖 Bot error:", err);
            }
          }
        }
      }
    );

    // ===========================================
    // 4. DISCONNECT
    // ===========================================
    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);

      // Dọn dẹp Active Rooms (Chỉ xóa khỏi list hiển thị, không xóa DB)
      for (let i = activeRooms.length - 1; i >= 0; i--) {
        const room = activeRooms[i];
        const roomObj = io.sockets.adapter.rooms.get(room.id);

        const hasActiveUsers =
          roomObj &&
          Array.from(roomObj).some((id) => {
            const s = io.sockets.sockets.get(id);
            return !s?.rooms.has("admin-room");
          });

        if (!hasActiveUsers) {
          activeRooms.splice(i, 1);
        }
      }
      io.to("admin-room").emit("active-rooms", activeRooms);
    });
  });
}
