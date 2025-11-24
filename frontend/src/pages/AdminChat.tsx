import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "../styles/Chat.css";

// 🔑 KHAI BÁO VÀ SỬ DỤNG BIẾN MÔI TRƯỜNG API
// Thay thế địa chỉ cố định 'http://localhost:5000' bằng biến môi trường
// Biến này sẽ chứa URL Ngrok (hoặc domain Production sau này)
const API_URL = process.env.REACT_APP_API_URL;

// Kiểm tra để tránh lỗi nếu biến môi trường chưa được đặt (chỉ nên xảy ra khi dev cục bộ)
if (!API_URL) {
  console.error(
    "Lỗi: REACT_APP_API_URL chưa được cấu hình. Sử dụng localhost làm dự phòng."
  );
}

// Socket.IO sẽ kết nối đến API_URL (Ngrok URL)
// Nếu API_URL rỗng, nó sẽ tự động kết nối đến URL cơ sở, nhưng dùng URL tường minh là tốt nhất.
const socket = io(API_URL || "http://localhost:5000");

const AdminChat: React.FC = () => {
  const [roomId, setRoomId] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );

  const joinRoom = (id: string) => {
    setRoomId(id);
    socket.emit("join-room", id);
  };

  useEffect(() => {
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("chat-history", (history) => {
      setMessages(history);
    });

    return () => {
      socket.off("chat-message");
      socket.off("chat-history");
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !roomId) return;
    const msg = { sender: "Admin", text: input, roomId, role: "admin" };
    socket.emit("chat-message", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <h2 className="chat-header">Admin Chat</h2>
      <input
        className="room-input"
        placeholder="Nhập mã phòng..."
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button className="join-btn" onClick={() => joinRoom(roomId)}>
        Tham gia
      </button>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${
              msg.sender === "Admin"
                ? "msg-admin"
                : msg.sender === "Bot"
                ? "msg-bot"
                : "msg-guest"
            }`}
          >
            <strong>{msg.sender}: </strong>
            {msg.text}
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

export default AdminChat;
