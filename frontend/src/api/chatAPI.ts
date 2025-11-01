const API_URL = "http://localhost:5000/api/chat";

export async function sendMessageToBot(message: string) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error("Chat API lỗi!");
  return res.json();
}

export {};
