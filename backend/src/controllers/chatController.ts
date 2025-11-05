import { Request, Response } from "express";
import { getMessages, handleChatMessage } from "../services/chatService";

export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const messages = await getMessages();
    res.json(messages);
  } catch (error) {
    console.error("❌ Lỗi lấy tin nhắn:", error);
    res.status(500).json({ error: "Không thể tải lịch sử chat." });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sender, text } = req.body;
    const botResponse = await handleChatMessage(sender, text);
    res.json(botResponse);
  } catch (error) {
    console.error("❌ Lỗi gửi tin:", error);
    res.status(500).json({ error: "Không thể gửi tin nhắn." });
  }
};
