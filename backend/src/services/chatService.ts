import { PrismaClient } from "@prisma/client";
import { getGeminiReply } from "../services/chatbotService"; // Đảm bảo đường dẫn đúng

const prisma = new PrismaClient();

/**
 * Lưu tin nhắn mới vào DB
 * ✅ Đã thêm tham số roomId bắt buộc
 */
export const saveMessage = async (data: {
  sender: string;
  text: string;
  roomId: string; // 🔥 THÊM: Bắt buộc phải có roomId
  role?: string;
}) => {
  try {
    return await prisma.message.create({
      data: {
        sender: data.sender,
        text: data.text,
        roomId: data.roomId, // 🔥 THÊM: Lưu roomId vào DB
        role: data.role || "guest",
      },
    });
  } catch (err) {
    console.error("❌ Lỗi lưu message:", err);
    throw err;
  }
};

/**
 * Lấy tin nhắn theo phòng (roomId)
 * ✅ Sửa lại để chỉ lấy của phòng cụ thể thay vì lấy toàn bộ DB
 */
export const getMessages = async (roomId: string) => {
  return prisma.message.findMany({
    where: { roomId: roomId }, // 🔥 THÊM: Lọc theo roomId
    orderBy: { createdAt: "asc" },
  });
};

/**
 * Xử lý tin nhắn: lưu + sinh phản hồi tự động
 * (Thường dùng cho API REST, nếu dùng Socket thì logic này đã có bên socket)
 */
export const handleChatMessage = async (
  sender: string,
  text: string,
  roomId: string // 🔥 THÊM: Cần biết đang chat trong phòng nào
) => {
  try {
    // 1️⃣ Lưu tin nhắn người gửi
    await saveMessage({
      sender,
      text,
      roomId, // Truyền roomId vào
      role: "guest",
    });

    // 2️⃣ Sinh phản hồi của bot
    const botText = await generateBotReply(text);

    // 3️⃣ Lưu phản hồi của bot vào DB
    const botMessage = await saveMessage({
      sender: "AI",
      text: botText,
      roomId, // Truyền roomId vào
      role: "bot",
    });

    return botMessage;
  } catch (error) {
    console.error("❌ Lỗi handleChatMessage:", error);
    throw error;
  }
};

/**
 * Sinh phản hồi từ AI (ưu tiên Gemini nếu có key)
 */
async function generateBotReply(input: string): Promise<string> {
  try {
    if (process.env.GEMINI_API_KEY) {
      // Dùng Gemini nếu có API key
      const geminiReply = await getGeminiReply(input);
      if (geminiReply) return geminiReply;
    }
  } catch (e) {
    console.warn("⚠️ Gemini lỗi hoặc hết quota, fallback sang rule-based.");
  }

  // Fallback: Rule-based miễn phí
  const msg = input.toLowerCase();
  if (msg.includes("chào")) {
    return "Xin chào! Tôi là trợ lý của Mộc Gốm 🏺. Bạn cần hỗ trợ gì hôm nay?";
  }
  if (msg.includes("giá")) {
    return "Các sản phẩm gốm có giá từ 189k đến 249k, tuỳ loại và kích thước nha.";
  }
  if (msg.includes("vận chuyển") || msg.includes("ship")) {
    return "Mộc Gốm có hỗ trợ giao hàng trong khu vực Hà Nội.";
  }
  if (msg.includes("địa chỉ") || msg.includes("ở đâu")) {
    return "Cửa hàng Mộc Gốm hiện ở số 25, đường Lê Văn Lương, quận Thanh Xuân, Hà Nội — bạn có thể ghé bất cứ lúc nào!";
  }

  return "Cảm ơn bạn đã liên hệ 💬. Bộ phận hỗ trợ sẽ phản hồi sớm nhất!";
}
