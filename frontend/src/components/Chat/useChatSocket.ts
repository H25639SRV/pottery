// src/components/chat/useChatSocket.ts
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  sender: "guest" | "admin" | "bot";
  text: string;
  createdAt?: string;
}

export function useChatSocket(userRole: "guest" | "admin") {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.emit("joinChat", { role: userRole });

    socket.on("chatMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("botMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userRole]);

  const sendMessage = (text: string) => {
    if (!socketRef.current) return;
    const message: ChatMessage = { sender: userRole, text };
    socketRef.current.emit("chatMessage", message);
    setMessages((prev) => [...prev, message]);
  };

  return { messages, sendMessage };
}
