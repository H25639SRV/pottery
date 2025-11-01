import { Server } from "socket.io";
import { saveMessage } from "../services/chatService";
import { getAIResponse } from "../services/aiService";

interface ChatMessage {
  sender: string;
  text: string;
  role?: string;
}

export const initChatSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`💬 Client kết nối: ${socket.id}`);

    socket.on("send_message", async (msg: ChatMessage) => {
      try {
        // Lưu tin nhắn của người dùng
        const saved = await saveMessage(msg);

        // Gửi tin nhắn đó lại cho tất cả client
        io.emit("receive_message", saved);

        // Nếu người gửi là guest → phản hồi chatbot
        if (msg.role === "guest") {
          const aiReply = await getAIResponse(msg.text);
          const botMsg: ChatMessage = {
            sender: "Mộc Gốm Bot",
            text: aiReply,
            role: "bot",
          };

          const savedBot = await saveMessage(botMsg);
          io.emit("receive_message", savedBot);
        }
      } catch (err) {
        console.error("❌ Socket error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client ngắt kết nối: ${socket.id}`);
    });
  });
};
