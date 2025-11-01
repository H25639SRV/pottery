import axios from "axios";

export const getAIReply = async (prompt: string) => {
  // Ví dụ gọi OpenAI GPT-4o-mini hoặc API tương đương
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return "Chatbot chưa được cấu hình.";

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chatbot của cửa hàng Mộc Gốm, chuyên tư vấn về sản phẩm gốm, Eat Clean và chăm sóc sức khỏe.",
        },
        { role: "user", content: prompt },
      ],
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );

  return response.data.choices[0].message.content.trim();
};
