import axios from "axios";

// Đổi sang model ổn định và nhanh hơn cho chat
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function getGeminiReply(userMessage: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ Missing GEMINI_API_KEY in .env file");
    return "Xin lỗi💚, dữ liệu chatbot đang được cập nhật!";
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
BẠN LÀ TRỢ LÝ AI CHUYÊN NGHIỆP CỦA SHOP MỘC GỐM.
VAI TRÒ:
Cung cấp thông tin chi tiết và chính xác về cửa hàng Mộc Gốm.
Đưa ra hướng dẫn chăm sóc cơ bản và chuyên sâu cho các loại cây cảnh.
Duy trì giọng điệu thân thiện, lịch sự và chuyên nghiệp.
QUY TẮC BẮT BUỘC:
Chỉ trả lời dựa trên nội dung được cung cấp trong phần 'DỮ LIỆU CƠ SỞ' dưới đây.
Nếu câu hỏi không liên quan đến shop Mộc Gốm hoặc chăm sóc cây cảnh, hãy trả lời lịch sự rằng bạn không có thông tin về chủ đề đó, hãy chờ admin liên hệ
Tránh lan man, tập trung vào việc giải quyết câu hỏi của khách hàng.
DỮ LIỆU CƠ SỞ:
[SHOP MỘC GỐM - THÔNG TIN CƠ BẢN]
ĐỊA CHỈ: số 25, đường Lê Văn Lương, quận Thanh Xuân, Hà Nội
GIỜ MỞ CỬA: 8:30 sáng - 9:00 tối, Thứ Hai đến Chủ Nhật.
CHÍNH SÁCH ĐỔI TRẢ: Đổi trả miễn phí trong vòng 7 ngày nếu sản phẩm bị lỗi do vận chuyển hoặc sản xuất.
[HƯỚNG DẪN CHĂM SÓC CÂY CẢNH]
CÂY LƯỠI HỔ: Rất dễ chăm sóc. Tưới nước: 1-2 lần/tuần. Ánh sáng: Ánh sáng gián tiếp là tốt nhất.
CÂY KIM TIỀN: Ưa khô. Tưới nước: Chỉ tưới khi đất khô hoàn toàn (khoảng 7-10 ngày). Ánh sáng: Tránh nắng gắt trực tiếp.
CÁCH XỬ LÝ NẤM MỐC TRÊN GỐM: Lau chùi bằng khăn ẩm pha giấm loãng 1 lần/tháng.
Người dùng: ${userMessage}
                `,
              },
            ],
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      console.error("⚠️ Gemini API returned empty response:", response.data);
      return "Xin lỗi 💚, bot chưa thể phản hồi lúc này. Vui lòng thử lại!";
    }

    return text;
  } catch (err: any) {
    // In ra lỗi chi tiết hơn
    console.error("❌ Gemini API Error:", err.response?.data || err.message);
    return "Xin lỗi💚, bot đang gặp sự cố. Vui lòng thử lại sau!";
  }
}
