import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Lưu tin nhắn mới vào database
 */
export const saveMessage = async (data: {
  sender: string;
  text: string;
  role?: string;
}) => {
  try {
    return await prisma.message.create({
      data: {
        sender: data.sender,
        text: data.text,
        role: data.role || "guest",
      },
    });
  } catch (err) {
    console.error("❌ Lỗi lưu message:", err);
    throw err;
  }
};

/**
 * Lấy toàn bộ tin nhắn (theo thứ tự thời gian)
 */
export const getMessages = async () => {
  return prisma.message.findMany({
    orderBy: { createdAt: "asc" },
  });
};

/**
 * Xử lý chat: lưu tin nhắn người dùng và sinh phản hồi bot
 */
export const handleChatMessage = async (sender: string, text: string) => {
  try {
    // 1️⃣ Lưu tin nhắn người gửi
    await prisma.message.create({
      data: {
        sender,
        text,
        role: "guest",
      },
    });

    // 2️⃣ Tạo phản hồi của bot
    const botText = generateBotReply(text);

    const botMessage = await prisma.message.create({
      data: {
        sender: "bot",
        text: botText,
        role: "bot",
      },
    });

    // 3️⃣ Trả về phản hồi để frontend hiển thị
    return botMessage;
  } catch (error) {
    console.error("❌ Lỗi trong handleChatMessage:", error);
    throw error;
  }
};

/**
 * Tạo phản hồi bot cơ bản
 */
function generateBotReply(input: string): string {
  const msg = input.toLowerCase();

  if (msg.includes("chào") || msg.includes("xin chào")) {
    return "Xin chào! Tôi là bot của Mộc Gốm 🌿. Bạn cần hỗ trợ gì hôm nay?";
  }
  if (msg.includes("giá") || msg.includes("bao nhiêu")) {
    return "Các sản phẩm gốm của Mộc Gốm có giá từ 150k đến 500k tuỳ loại.";
  }
  if (msg.includes("địa chỉ") || msg.includes("ở đâu")) {
    return "Cửa hàng Mộc Gốm hiện tại ở Hà Nội — bạn có thể ghé thăm bất kỳ lúc nào nhé! 🏺";
  }

  return "Cảm ơn bạn đã nhắn tin 💬. Bộ phận hỗ trợ sẽ phản hồi sớm nhất!";
}
