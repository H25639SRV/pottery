import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import ChatMessage from "../components/Chat/ChatMessage";
import ChatInput from "../components/Chat/ChatInput";

interface Message {
  sender: string;
  text: string;
  role?: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);

    s.on("connect", () => console.log("✅ Kết nối Socket.IO thành công"));
    s.on("chat-message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const handleSend = (text: string) => {
    if (!socket) return;
    const message: Message = { sender: "Guest", text, role: "guest" };
    socket.emit("chat-message", message);
    setMessages((prev) => [...prev, message]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <ChatMessage
            key={i}
            sender={m.sender}
            text={m.text}
            role={m.role}
            isOwn={m.sender === "Guest"}
          />
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatPage;
