import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getChatbotResponseWithHistory, searchProducts, createProductsMessage } from '../services/chatbotService';
import ChatMessage from './ChatMessage';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  // التمرير إلى آخر رسالة عند إضافة رسائل جديدة
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // رسالة الترحيب عند فتح الشات بوت
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = currentLanguage === 'ar' 
        ? 'مرحبًا! كيف يمكنني مساعدتك اليوم؟' 
        : 'Hello! How can I help you today?';
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, currentLanguage]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // إضافة رسالة المستخدم
    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInput('');
    setIsLoading(true);
    
    try {
      // التحقق مما إذا كان المستخدم يبحث عن منتجات
      const isProductSearch = userMessage.toLowerCase().includes('منتج') || 
                             userMessage.toLowerCase().includes('product') ||
                             userMessage.toLowerCase().includes('بحث');
      
      if (isProductSearch) {
        // البحث عن المنتجات
        const products = await searchProducts(userMessage, 4);
        const productMessage = createProductsMessage(products, currentLanguage);
        setMessages(prev => [...prev, productMessage]);
      } else {
        // الحصول على رد الشات بوت العادي
        const botResponse = await getChatbotResponseWithHistory(
          userMessage,
          messages.map(msg => ({ 
            role: msg.isUser ? 'user' : 'assistant', 
            content: msg.text || msg
          })),
          user?.uid
        );
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      const errorMessage = currentLanguage === 'ar' 
        ? 'عذرًا، حدث خطأ. يرجى المحاولة مرة أخرى.' 
        : 'Sorry, an error occurred. Please try again.';
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleChatbot = () => {
    setIsOpen(prev => !prev);
  };
  
  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <button className="chatbot-toggle" onClick={toggleChatbot}>
        {isOpen ? '✕' : '💬'}
      </button>
      
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>{currentLanguage === 'ar' ? 'مساعد المتجر' : 'Store Assistant'}</h3>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                message={message} 
                isUser={message.isUser} 
              />
            ))}
            {isLoading && (
              <div className="bot-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentLanguage === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              {currentLanguage === 'ar' ? 'إرسال' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;