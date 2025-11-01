import React, { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex items-center border-t border-gray-300 p-2">
      <input
        type="text"
        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-400"
        placeholder="Nhập tin nhắn..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={handleSend}
        className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Gửi
      </button>
    </div>
  );
};

export default ChatInput;
