// src/components/chat/ChatWidget.tsx
import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import "../../styles/Chat.css";

const ChatWidget: React.FC<{ userRole?: "guest" | "admin" }> = ({
  userRole = "guest",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <ChatWindow userRole={userRole} onClose={() => setOpen(false)} />
      ) : (
        <button className="chat-button" onClick={() => setOpen(true)}>
          💬 Chat
        </button>
      )}
    </>
  );
};

export default ChatWidget;
