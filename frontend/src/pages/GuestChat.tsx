import React, { useState, useEffect } from "react";

import io from "socket.io-client";

import "../styles/Chat.css";

// 🔑 KHAI BÁO BIẾN MÔI TRƯỜNG API URL

const API_URL = process.env.REACT_APP_API_URL || "http://backend:5000";

// Socket.IO sẽ kết nối đến API_URL (Ngrok URL)

const socket = io(API_URL, { transports: ["websocket"] });

const GuestChat: React.FC = () => {
  const [roomId] = useState(`room-${Math.floor(Math.random() * 10000)}`);

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );

  useEffect(() => {
    socket.emit("join-room", roomId);

    // Nhận lịch sử phòng khi vừa vào

    const handleHistory = (history: any[]) => {
      setMessages(history);
    };

    // Nhận tin nhắn mới

    const handleMessage = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat-history", handleHistory);

    socket.on("chat-message", handleMessage);

    return () => {
      socket.off("chat-history", handleHistory);

      socket.off("chat-message", handleMessage);
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = { sender: "Khách", text: input, roomId, role: "guest" };

    socket.emit("chat-message", msg);

    // 🎯 FIX: Thêm ngay tin nhắn vào danh sách để phản hồi tức thì
    setMessages((prev) => [...prev, msg]);

    setInput("");
  };
  return (
    <div className="chat-container guest-theme">
      <h3 className="chat-header">Khách hàng 💚 Mộc Gốm</h3>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${
              msg.sender === "Khách"
                ? "msg-guest"
                : msg.sender === "Bot"
                ? "msg-bot"
                : "msg-admin"
            }`}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage} disabled={!roomId}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default GuestChat;
