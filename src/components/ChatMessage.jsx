import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import ChatbotProductsDisplay from './ChatbotProductsDisplay';
import './ChatMessage.css';

const ChatMessage = ({ message, isUser }) => {
  useLanguage();
  
  // التحقق مما إذا كانت الرسالة تحتوي على منتجات
  const hasProducts = !isUser && message.products && message.products.length > 0;
  
  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="message-content">
        {/* عرض نص الرسالة */}
        <p>{hasProducts ? message.text : message}</p>
        
        {/* عرض المنتجات إذا كانت موجودة */}
        {hasProducts && (
          <ChatbotProductsDisplay 
            products={message.products} 
            layout={message.products.length > 2 ? 'grid' : 'list'} 
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;