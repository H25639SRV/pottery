import { getAIReply } from "../utils/aiClient";

export const getAIResponse = async (userMessage: string) => {
  try {
    const response = await getAIReply(userMessage);
    return response;
  } catch (error) {
    console.error("❌ Lỗi gọi AI:", error);
    return "Xin lỗi, hiện tại tôi không thể trả lời. Vui lòng đợi admin nhé!";
  }
};
