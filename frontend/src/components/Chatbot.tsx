import React, { useState } from "react";
import "../styles/Chatbot.css";
import { sendMessageToBot } from "../api/chatAPI";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await sendMessageToBot(input);
      setMessages((prev) => [...prev, { from: "bot", text: response.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Lỗi kết nối server" },
      ]);
    }

    setInput("");
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">💬 Mộc Gốm AI</div>
      <div className="chatbot-body">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.from}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot-footer">
        <input
          type="text"
          value={input}
          placeholder="Nhập tin nhắn..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Gửi</button>
      </div>
    </div>
  );
};

export default Chatbot;
