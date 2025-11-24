import React, { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import "../../styles/ChatWidget.css";
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

interface RoomInfo {
  id: string;
  guestName: string;
  lastMessage?: string;
}

const CHAT_API_URL =
  process.env.REACT_APP_CHAT_API_URL || "http://localhost:5000";
const ENDPOINT = CHAT_API_URL;

const ChatWidget: React.FC<ChatWidgetProps> = () => {
  const auth = useAuth();
  const username =
    auth?.user?.username || localStorage.getItem("username") || "Khách";

  const roleFromAuth = (
    auth?.user?.role ||
    localStorage.getItem("role") ||
    "USER"
  )
    .toString()
    .toUpperCase();

  const userRole: UserRole = roleFromAuth === "ADMIN" ? "admin" : "guest";

  const socketRef = useRef<Socket | null>(null);
  const [open, setOpen] = useState(false);

  // ✅ 1. Lấy roomId từ LocalStorage khi khởi tạo
  const [roomId, setRoomId] = useState<string | null>(
    localStorage.getItem("chat_room_id")
  );
  const roomIdRef = useRef<string | null>(localStorage.getItem("chat_room_id"));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeRooms, setActiveRooms] = useState<RoomInfo[]>([]);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const seenSet = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

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
        // ✅ 2. Gửi roomId cũ (nếu có) lên server
        const savedRoomId = localStorage.getItem("chat_room_id");
        socket.emit("join-guest", { username, roomId: savedRoomId });
      }
    });

    socket.on("room-created", (payload: { roomId: string }) => {
      if (payload?.roomId) {
        roomIdRef.current = payload.roomId;
        setRoomId(payload.roomId);
        // ✅ 3. Lưu roomId mới vào LocalStorage
        localStorage.setItem("chat_room_id", payload.roomId);
      }
    });

    socket.on("active-rooms", (rooms: RoomInfo[]) => {
      setActiveRooms((prevRooms) => {
        return rooms.map((room) => {
          const existing = prevRooms.find((r) => r.id === room.id);
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
          prevRooms.map((room) =>
            room.id === payload.roomId
              ? { ...room, lastMessage: payload.preview }
              : room
          )
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

  // Focus input khi mở chat
  useEffect(() => {
    if (open && inputRef.current && (userRole === "guest" || roomId)) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, roomId, userRole]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && userRole === "admin" && socketRef.current) {
      socketRef.current.emit("request-active-rooms");
    }
  };

  const handleAdminJoin = (room: RoomInfo) => {
    if (!socketRef.current) return;
    socketRef.current.emit("join-room-admin", room.id);
    roomIdRef.current = room.id;
    setRoomId(room.id);
    setMessages([]);
    seenSet.current.clear();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;

    // Nếu là Guest mà chưa có roomId, không cho gửi
    if (!roomIdRef.current && userRole === "guest") {
      alert("Đang kết nối... Vui lòng thử lại sau giây lát.");
      return;
    }

    // Nếu là Admin mà chưa chọn phòng
    if (!roomIdRef.current && userRole === "admin") {
      alert("Vui lòng chọn phòng chat để gửi tin.");
      return;
    }

    const msg: ChatMessage = {
      sender: username,
      text: input.trim(),
      roomId: roomIdRef.current!, // Chắc chắn có roomId
      role: userRole,
      createdAt: new Date().toISOString(),
    };

    socketRef.current.emit("chat-message", msg);
    addMessage(msg);
    setInput("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <>
      <button className="chat-circle" onClick={handleOpen}>
        <i className="fa-solid fa-comment"></i>
      </button>

      {open && (
        <>
          {userRole === "admin" ? (
            /* --- ADMIN VIEW --- */
            <div className="chat-box floating admin-layout">
              <div className="admin-rooms-sidebar">
                <div className="chat-header sidebar-header">
                  <strong>Cuộc trò chuyện ({activeRooms.length})</strong>
                </div>
                <div className="admin-rooms-list">
                  {activeRooms.length === 0 ? (
                    <div className="empty-text">Không có khách online.</div>
                  ) : (
                    activeRooms.map((r) => (
                      <div
                        key={r.id}
                        className={`room-item ${
                          r.id === roomId ? "active-room" : ""
                        }`}
                        onClick={() => handleAdminJoin(r)}
                      >
                        <div className="room-info-content">
                          <strong className="guest-name">{r.guestName}</strong>
                          {r.lastMessage && (
                            <div className="last-msg">{r.lastMessage}</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="admin-chat-view">
                <div className="chat-header main-chat-header">
                  <div className="header-content-group">
                    <div>Admin: {username}</div>
                    <div className="room-id-display">
                      {roomId
                        ? `Phòng: ${
                            activeRooms.find((r) => r.id === roomId)
                              ?.guestName || "Đang chat"
                          }`
                        : "Chưa chọn phòng"}
                    </div>
                  </div>
                  <button className="close-btn" onClick={() => setOpen(false)}>
                    <i className="fa fa-times" aria-hidden="true"></i>
                  </button>
                </div>
                <div ref={messagesRef} className="chat-body">
                  {!roomId ? (
                    <div className="empty-text">
                      Chọn một phòng chat để xem tin nhắn.
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="empty-text">Chưa có tin nhắn nào.</div>
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
                      return (
                        <div key={i} className={`chat-message ${cls}`}>
                          <div>{m.text}</div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="chat-footer">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    placeholder={!roomId ? "Chọn phòng..." : "Nhập tin nhắn..."}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!roomId}
                  />
                  <button onClick={handleSend} disabled={!roomId}>
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- GUEST VIEW --- */
            <div className="chat-box floating">
              <div className="chat-header main-chat-header">
                <div className="header-content-group">
                  <div>Hỗ trợ khách hàng</div>
                </div>
                <button className="close-btn" onClick={() => setOpen(false)}>
                  <i className="fa fa-times" aria-hidden="true"></i>
                </button>
              </div>
              <div ref={messagesRef} className="chat-body">
                {messages.length === 0 ? (
                  <div className="empty-text">
                    Chào bạn! Mộc Gốm có thể giúp gì cho bạn?
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
                    return (
                      <div key={i} className={`chat-message ${cls}`}>
                        <div>{m.text}</div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="chat-footer">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  placeholder="Nhập tin nhắn..."
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button onClick={handleSend}>Gửi</button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ChatWidget;
