// frontend/src/services/botService.ts
export async function getAIReply(message: string): Promise<string> {
  try {
    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    return data.reply;
  } catch (error) {
    console.error(error);
    return "⚠️ Không thể kết nối tới AI server.";
  }
}
