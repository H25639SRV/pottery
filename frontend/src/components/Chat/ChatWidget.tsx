import React, { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import "../../styles/Chat.css";
import { useAuth } from "../../context/AuthContext";

interface ChatWidgetProps {}

type UserRole = "admin" | "guest";

interface ChatMessage {
  sender: string;
  text: string;
  roomId: string;
  role: "guest" | "admin" | "bot" | "system";
  createdAt?: string;
}

// 🐛 Sửa lỗi TypeScript: Cập nhật Interface RoomInfo để bao gồm lastMessage
interface RoomInfo {
  id: string;
  guestName: string;
  lastMessage?: string; // <== Đã thêm thuộc tính này
}

// Giả định ENDPOINT là backend service
const ENDPOINT = `http://${window.location.hostname}:5000`; // Hoặc `http://localhost:5000` nếu chạy local

const ChatWidget: React.FC<ChatWidgetProps> = () => {
  const auth = useAuth();
  const username =
    auth?.username || localStorage.getItem("username") || "Khách";
  const roleFromAuth = (auth?.role || localStorage.getItem("role") || "USER")
    .toString()
    .toUpperCase();
  const userRole: UserRole = roleFromAuth === "ADMIN" ? "admin" : "guest";

  const socketRef = useRef<Socket | null>(null);
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  // 🎯 Sửa lỗi: Sử dụng RoomInfo đã được cập nhật
  const [activeRooms, setActiveRooms] = useState<RoomInfo[]>([]);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const seenSet = useRef<Set<string>>(new Set());

  const addMessage = useCallback((msg: ChatMessage) => {
    const key = `${msg.sender}:${msg.text}:${msg.createdAt || ""}`;
    if (seenSet.current.has(key)) return;

    seenSet.current.add(key);
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    const socket = io(ENDPOINT, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Chat socket connected:", socket.id);

      if (userRole === "admin") {
        socket.emit("join-admin");
      } else {
        socket.emit("join-guest", username);
      }
    });

    socket.on("room-created", (payload: { roomId: string }) => {
      if (payload?.roomId) {
        roomIdRef.current = payload.roomId;
        setRoomId(payload.roomId);
      }
    });

    // 🎯 Cập nhật kiểu dữ liệu cho rooms
    socket.on("active-rooms", (rooms: RoomInfo[]) => {
      setActiveRooms((prevRooms) => {
        // Tối ưu hóa: Giữ lại lastMessage của phòng cũ
        return rooms.map((room) => {
          const existing = prevRooms.find((r) => r.id === room.id);
          // Sử dụng lastMessage từ existing nếu room mới không cung cấp (hoặc ngược lại)
          return {
            ...room,
            lastMessage: existing?.lastMessage || room.lastMessage,
          };
        });
      });
    });

    socket.on(
      "new-message-in-room",
      (payload: { roomId: string; preview: string }) => {
        setActiveRooms((prevRooms) =>
          prevRooms.map((room) => {
            if (room.id === payload.roomId) {
              // Chỉ cập nhật preview, không ảnh hưởng đến trạng thái active
              return { ...room, lastMessage: payload.preview };
            }
            return room;
          })
        );
      }
    );

    socket.on("chat-history", (history: ChatMessage[]) => {
      seenSet.current.clear();
      setMessages([]);

      history.forEach(addMessage);
    });

    socket.on("chat-message", (msg: ChatMessage) => {
      if (msg.roomId !== roomIdRef.current) return;

      addMessage(msg);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      seenSet.current.clear();
    };
  }, [userRole, username, addMessage]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && userRole === "admin" && socketRef.current) {
      socketRef.current.emit("request-active-rooms");
    }
  };

  const handleAdminJoin = (room: RoomInfo) => {
    if (!socketRef.current) return;

    // Admin join phòng cụ thể
    socketRef.current.emit("join-room-admin", room.id);

    // Cập nhật state và ref
    roomIdRef.current = room.id;
    setRoomId(room.id);
    setMessages([]);
    seenSet.current.clear();
  };

  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;
    if (!roomIdRef.current) {
      if (userRole === "guest") {
        alert("Vui lòng đợi hệ thống tạo phòng chat...");
        return;
      }
      alert("Vui lòng chọn phòng chat để gửi tin.");
      return;
    }

    const msg: ChatMessage = {
      sender: username,
      text: input.trim(),
      roomId: roomIdRef.current,
      role: userRole,
      createdAt: new Date().toISOString(),
    };

    socketRef.current.emit("chat-message", msg);

    // Tự động hiển thị tin nhắn của mình ngay lập tức
    addMessage(msg);

    setInput("");
  };

  const AdminChatView = () => (
    <div className="chat-box floating admin-layout">
      <div className="admin-rooms-sidebar">
        <div className="chat-header sidebar-header">
          <strong>Cuộc trò chuyện đang chờ ({activeRooms.length})</strong>
        </div>
        <div className="admin-rooms-list">
          {activeRooms.length === 0 ? (
            <div className="empty-text">Không có phòng nào đang hoạt động.</div>
          ) : (
            activeRooms.map((r) => (
              <div
                key={r.id}
                className={`room-item ${r.id === roomId ? "active-room" : ""}`}
                onClick={() => handleAdminJoin(r)}
              >
                <div className="room-info">
                  <strong className="guest-name">{r.guestName}</strong>
                  {/* Cắt bớt ID phòng để hiển thị gọn hơn */}
                  <div className="room-id">
                    ID: {r.id.split("-").slice(0, 2).join("-")}
                  </div>
                  {r.lastMessage && (
                    <div className="last-msg">
                      {r.lastMessage.substring(0, 30)}
                      {r.lastMessage.length > 30 ? "..." : ""}
                    </div>
                  )}
                </div>
                <div className="room-action">
                  {r.id === roomId ? "Đang xem" : "Vào"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-chat-view">
        <div className="chat-header">
          <div>👩‍💼 **Admin: {username}**</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            {roomId
              ? `Phòng: ${
                  activeRooms.find((r) => r.id === roomId)?.guestName || roomId
                }`
              : "Chưa chọn phòng"}
          </div>
          <button className="close-btn" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <div ref={messagesRef} className="chat-body">
          {!roomId ? (
            <div className="empty-text">
              Chọn một phòng chat ở cột bên trái để xem cuộc trò chuyện.
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-text">Bắt đầu trò chuyện!</div>
          ) : (
            messages.map((m, i) => {
              const isOwn = m.role === "admin" && m.sender === username;

              const cls =
                m.role === "bot"
                  ? "msg-bot"
                  : isOwn
                  ? "msg-own"
                  : m.role === "admin"
                  ? "msg-admin"
                  : "msg-guest";

              let senderDisplay = m.sender;
              if (m.role === "bot") {
                senderDisplay = "Bot Mộc Gốm";
              } else if (m.role === "admin" && !isOwn) {
                senderDisplay = `Admin (${m.sender})`;
              } else if (m.role === "guest") {
                // Lấy tên Guest từ danh sách phòng nếu có
                senderDisplay =
                  activeRooms.find((r) => r.id === m.roomId)?.guestName ||
                  m.sender;
              }

              return (
                <div key={i} className={`chat-message ${cls}`}>
                  <div className="sender">
                    <strong>{senderDisplay}</strong>{" "}
                    <span className="time">
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <div>{m.text}</div>
                </div>
              );
            })
          )}
        </div>

        <div className="chat-footer">
          <input
            type="text"
            value={input}
            placeholder={
              !roomId ? "Vui lòng chọn phòng để chat..." : "Nhập tin nhắn..."
            }
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={!roomId}
          />
          <button onClick={handleSend} disabled={!roomId}>
            Gửi
          </button>
        </div>
      </div>
    </div>
  );

  const GuestChatView = () => (
    <div className="chat-box floating">
      <div className="chat-header">
        <div>🧑‍🍳 Khách hàng: **{username}**</div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          {roomId || "Đang tạo phòng..."}
        </div>
        <button className="close-btn" onClick={() => setOpen(false)}>
          ✕
        </button>
      </div>

      <div ref={messagesRef} className="chat-body">
        {messages.length === 0 ? (
          <div className="empty-text">
            Hãy gửi tin nhắn để bắt đầu trò chuyện cùng Mộc Gốm 🌿
          </div>
        ) : (
          messages.map((m, i) => {
            const isOwn = m.role === "guest" && m.sender === username;

            const cls =
              m.role === "bot"
                ? "msg-bot"
                : isOwn
                ? "msg-own"
                : m.role === "admin"
                ? "msg-admin"
                : "msg-guest";

            let senderDisplay = m.sender;
            if (m.role === "bot") {
              senderDisplay = "Bot Mộc Gốm";
            } else if (m.role === "admin") {
              senderDisplay = `Admin`;
            }

            return (
              <div key={i} className={`chat-message ${cls}`}>
                <div className="sender">
                  <strong>{senderDisplay}</strong>{" "}
                  <span className="time">
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
                <div>{m.text}</div>
              </div>
            );
          })
        )}
      </div>

      <div className="chat-footer">
        <input
          type="text"
          value={input}
          placeholder="Nhập tin nhắn..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={!roomId}>
          Gửi
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="chat-circle"
        onClick={handleOpen}
        aria-label="Open chat"
      >
        💬
      </button>

      {open && (userRole === "admin" ? <AdminChatView /> : <GuestChatView />)}
    </>
  );
};

export default ChatWidget;
