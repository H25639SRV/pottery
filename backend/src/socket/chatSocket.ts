import { Server, Socket } from "socket.io";
import { getGeminiReply } from "../services/chatbotService"; // Dùng từ services vì bot logic nằm ở đó

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

// KHÔNG DÙNG DB: Lưu tạm thời trong bộ nhớ
const messageHistory: Record<string, ChatMessage[]> = {};
const activeRooms: RoomInfo[] = [];

/**
 * Socket Chat Controller
 * - Guest tạo phòng tự động
 * - Admin nhận danh sách phòng và có thể join
 * - Bot chỉ phản hồi khi admin chưa tham gia
 */
export function initChatSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Client connected: ${socket.id}`);

    // ===== GUEST JOIN & CREATE ROOM =====
    socket.on("join-guest", (username: string) => {
      // 1. Tạo Room ID
      const roomId = `room-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      socket.join(roomId);

      // 2. Gửi Room ID lại cho Guest
      socket.emit("room-created", { roomId });

      // 3. Cập nhật rooms nếu chưa có
      if (!activeRooms.find((r) => r.id === roomId)) {
        activeRooms.push({ id: roomId, guestName: username });
        // 4. Thông báo cho tất cả admin
        io.to("admin-room").emit("active-rooms", activeRooms);
      }

      console.log(`🧑‍🍳 Guest ${username} created room ${roomId}`);
    });

    // Admin join phòng chat (để nhận danh sách phòng)
    socket.on("join-admin", () => {
      socket.join("admin-room");
      console.log(`🛠️ Admin ${socket.id} joined admin-room`);
      socket.emit("active-rooms", activeRooms);
    });

    // Admin join phòng chat CỤ THỂ
    socket.on("join-room-admin", (roomId: string) => {
      // 1. Join phòng mới
      socket.join(roomId);
      console.log(`👩‍💼 Admin joined room ${roomId}`);

      // 2. Gửi lịch sử chat
      if (messageHistory[roomId]) {
        socket.emit("chat-history", messageHistory[roomId]);
      } else {
        socket.emit("chat-history", []);
      }
    });

    // Yêu cầu danh sách phòng hiện có
    socket.on("request-active-rooms", () => {
      socket.emit("active-rooms", activeRooms);
    });

    // ===== CHAT MESSAGE =====
    socket.on(
      "chat-message",
      async (msg: {
        sender: string;
        text: string;
        roomId: string;
        role: "guest" | "admin";
        createdAt?: string;
      }) => {
        console.log(
          `💬 Message from ${msg.sender} (${msg.role}) in ${msg.roomId}: ${msg.text}`
        );

        if (!messageHistory[msg.roomId]) messageHistory[msg.roomId] = [];
        const chatMsg: ChatMessage = {
          sender: msg.sender,
          text: msg.text,
          roomId: msg.roomId,
          role: msg.role,
          createdAt: msg.createdAt || new Date().toISOString(),
        };
        messageHistory[msg.roomId].push(chatMsg);

        // Gửi tin nhắn tới tất cả trong phòng (trừ người gửi)
        // **LƯU Ý:** Vì ChatWidget đã tự hiển thị tin nhắn của mình, ta dùng socket.to()
        socket.to(msg.roomId).emit("chat-message", chatMsg);

        // Gửi thông báo đến Admin-room (cập nhật preview tin nhắn)
        io.to("admin-room").emit("new-message-in-room", {
          roomId: msg.roomId,
          preview: msg.text,
        });

        // Nếu khách gửi → bot phản hồi khi chưa có admin
        if (msg.role === "guest") {
          const room = io.sockets.adapter.rooms.get(msg.roomId);

          // Kiểm tra: Có bất kỳ socket nào trong phòng này đang join 'admin-room' không
          const hasAdmin =
            room &&
            Array.from(room).some((id) => {
              const s = io.sockets.sockets.get(id);
              // Kiểm tra socket đó có join 'admin-room' không
              return s?.rooms.has("admin-room");
            });

          if (!hasAdmin) {
            // Nếu KHÔNG CÓ Admin trong phòng
            try {
              const replyText = await getGeminiReply(msg.text);
              const botMsg: ChatMessage = {
                sender: "Bot",
                text: replyText,
                roomId: msg.roomId,
                role: "bot",
                createdAt: new Date().toISOString(),
              };
              messageHistory[msg.roomId].push(botMsg);

              // Gửi tin nhắn bot tới phòng
              io.to(msg.roomId).emit("chat-message", botMsg);

              // **Tối ưu hóa:** Cập nhật lại danh sách phòng trên Admin-room với tin nhắn cuối là của Bot
              io.to("admin-room").emit("new-message-in-room", {
                roomId: msg.roomId,
                preview: botMsg.text,
              });
            } catch (err) {
              console.error("🤖 Bot error:", err);
              // ... (Logic Fallback Bot giữ nguyên)
            }
          }
        }
      }
    );

    // ===== DISCONNECT =====
    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);

      // Cập nhật lại danh sách phòng
      for (let i = activeRooms.length - 1; i >= 0; i--) {
        const room = activeRooms[i];
        const roomObj = io.sockets.adapter.rooms.get(room.id);

        // Nếu không còn ai trong phòng và không còn ai là Admin đang xem phòng đó
        const hasActiveUsers =
          roomObj &&
          Array.from(roomObj).some((id) => {
            const s = io.sockets.sockets.get(id);
            // Giả định: Người dùng bình thường không join 'admin-room'
            return !s?.rooms.has("admin-room");
          });

        // Nếu không còn bất kỳ Guest nào (và không có Admin nào đang join phòng đó), xóa phòng
        if (!hasActiveUsers) {
          activeRooms.splice(i, 1);
          delete messageHistory[room.id];
        }
      }

      // Thông báo cho Admin-room danh sách phòng đã cập nhật
      io.to("admin-room").emit("active-rooms", activeRooms);
    });
  });
}
