import React from "react";

interface ChatMessageProps {
  sender: string;
  text: string;
  role?: string;
  isOwn?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  text,
  role,
  isOwn = false,
}) => {
  const bgColor =
    role === "bot" ? "bg-yellow-100" : isOwn ? "bg-green-200" : "bg-gray-200";

  return (
    <div
      className={`flex flex-col my-2 ${isOwn ? "items-end" : "items-start"}`}
    >
      <div className={`max-w-xs px-4 py-2 rounded-2xl shadow ${bgColor}`}>
        <p className="text-sm">{text}</p>
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {role === "bot" ? "Bot Mộc Gốm" : sender}
      </span>
    </div>
  );
};

export default ChatMessage;
