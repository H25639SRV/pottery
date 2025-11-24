import { Request, Response } from "express";
import { handleChatMessage, getMessages } from "../services/chatService";

/**
 * GET /api/chat/history/:roomId
 * Lấy lịch sử chat theo phòng
 */
export const getHistory = async (req: Request, res: Response) => {
  try {
    // 1. Lấy roomId từ params (ví dụ: /api/chat/history/room-123)
    const { roomId } = req.params;

    // Kiểm tra nếu không có roomId
    if (!roomId) {
      return res
        .status(400)
        .json({ error: "Thiếu roomId (Room ID is required)" });
    }

    // ✅ SỬA LỖI 1: Truyền roomId vào hàm getMessages
    const history = await getMessages(roomId);

    res.json(history);
  } catch (error) {
    console.error("Lỗi lấy lịch sử chat:", error);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

/**
 * POST /api/chat/send
 * Gửi tin nhắn mới (Dùng cho REST API, nếu dùng Socket thì ít dùng cái này)
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    // Lấy dữ liệu từ body
    const { sender, text, roomId } = req.body;

    if (!sender || !text || !roomId) {
      return res
        .status(400)
        .json({ error: "Thiếu thông tin (sender, text, roomId)" });
    }

    // ✅ SỬA LỖI 2: Truyền roomId vào tham số thứ 3
    const result = await handleChatMessage(sender, text, roomId);

    res.json(result);
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error);
    res.status(500).json({ error: "Lỗi Server" });
  }
};
