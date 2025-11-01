// src/components/chat/ChatWindow.tsx
import React, { useState } from "react";
import { useChatSocket } from "./useChatSocket";
import "../../styles/Chat.css";

interface ChatWindowProps {
  userRole: "guest" | "admin";
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ userRole, onClose }) => {
  const { messages, sendMessage } = useChatSocket(userRole);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        💬 Mộc Gốm Chat
        <button onClick={onClose}>×</button>
      </div>
      <div className="chat-body">
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.sender}`}>
            <strong>
              {m.sender === "bot"
                ? "Bot"
                : m.sender === "admin"
                ? "Admin"
                : "Bạn"}
              :
            </strong>{" "}
            {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Gửi</button>
      </div>
    </div>
  );
};

export default ChatWindow;
