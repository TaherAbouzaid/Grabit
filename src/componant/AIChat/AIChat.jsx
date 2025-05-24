import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { BiSend } from "react-icons/bi";
import {
  getChatbotResponseWithHistory,
  searchProducts,
  createProductsMessage,
} from "../../services/chatbotService";
import { useAuth } from "../../context/AuthContext";
import "./AIChat.css";
import { useSelector } from "react-redux";
import ChatbotProductsDisplay from "../../components/ChatbotProductsDisplay";

const AIChat = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const cart = useSelector((state) => state.cart.items);
  const [messages, setMessages] = useState([
    { text: t("chatbot.welcome"), isBot: true },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { i18n } = useTranslation();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const newUserMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, newUserMessage]);
    const userMessage = input;
    setInput("");
    setIsLoading(true);

    try {
      // Check if the user message is a product search query
      const lowerUserMessage = userMessage.toLowerCase();
      const isProductSearch =
        lowerUserMessage.includes("product") ||
        lowerUserMessage.includes("منتج") ||
        lowerUserMessage.includes("search") ||
        lowerUserMessage.includes("بحث") ||
        lowerUserMessage.includes(t("category")); // Check for category keyword in current language

      let botResponse;

      if (isProductSearch) {
        // Perform product search
        const products = await searchProducts(userMessage);
        // Create a message object that includes the products
        botResponse = createProductsMessage(products, i18n.language); // Pass current language
      } else {
        // Create conversation history for context
        const conversationHistory = messages
          .slice(-6) // Only use last 6 messages for context
          .map((msg) => ({
            role: msg.isBot ? "assistant" : "user",
            // Use msg.text for simple text messages, handle structured messages if needed
            content:
              typeof msg.text === "string" ? msg.text : msg.text?.text || "",
          }));

        // Get response from AI service with conversation history and cart data
        botResponse = await getChatbotResponseWithHistory(
          userMessage,
          conversationHistory,
          user?.uid || null,
          cart
        );
      }

      // Add bot response (which can be a string or an object with products)
      setMessages((prev) => [...prev, { ...botResponse, isBot: true }]); // Spread botResponse to include products if present
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: t("chatbot.error"),
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-popup-container">
      <div className="chat-popup-header">
        <h5>{t("chatbot.title")}</h5>
      </div>
      <div className="chat-popup-body">
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.isBot ? "bot-message" : "user-message"
              }`}
            >
              {msg.products && msg.products.length > 0 ? (
                <ChatbotProductsDisplay
                  products={msg.products}
                  layout={msg.products.length > 2 ? "grid" : "list"}
                />
              ) : (
                <p>
                  {typeof msg.text === "string"
                    ? msg.text
                    : msg.text?.text || ""}
                </p>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message loading-message">
              <Spinner animation="grow" size="sm" />
              <Spinner animation="grow" size="sm" className="mx-2" />
              <Spinner animation="grow" size="sm" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="chat-popup-footer">
        <Form onSubmit={handleSend} className="d-flex">
          <Form.Control
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chatbot.inputPlaceholder")}
            className="chat-input"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="success"
            className="ms-2 send-button"
            disabled={isLoading || !input.trim()}
          >
            <BiSend />
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AIChat;
