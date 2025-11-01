import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Lấy toàn bộ tin nhắn
export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    console.error("❌ Lỗi lấy tin nhắn:", error);
    res.status(500).json({ error: "Không thể tải lịch sử chat." });
  }
};

// Gửi tin nhắn mới (dành cho REST fallback)
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sender, text, role } = req.body;
    const newMessage = await prisma.message.create({
      data: { sender, text, role },
    });
    res.json(newMessage);
  } catch (error) {
    console.error("❌ Lỗi gửi tin:", error);
    res.status(500).json({ error: "Không thể gửi tin nhắn." });
  }
};
