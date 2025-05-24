import React, { useState } from "react";
import { BsChatDotsFill } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import AIChat from "./AIChat";
import "./ChatbotButton.css";

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-popup">
          <AIChat />
        </div>
      )}
      <button 
        className="chatbot-button" 
        onClick={toggleChat}
        aria-label="Chat with AI assistant"
      >
        {isOpen ? <IoMdClose size={24} /> : <BsChatDotsFill size={24} />}
      </button>
    </div>
  );
};

export default ChatbotButton;