import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { BiSend } from "react-icons/bi";
import {
  getChatbotResponseWithHistory,
  searchProducts,
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

  // تحسين معالجة الرسائل
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      const lowerUserMessage = userMessage.toLowerCase();

      // --- Parameter Extraction ---
      let searchKeywords = lowerUserMessage; // Start with the whole message
      let detectedCategoryName = null;
      let sortBy = null;

      // Check for category mention
      const categoryMatchAr = lowerUserMessage.match(/(?:في|بفئة)\s+([^\s]+)/);
      const categoryMatchEn = lowerUserMessage.match(
        /(?:in|category)\s+([^\s]+)/
      );

      if (categoryMatchAr) {
        detectedCategoryName = categoryMatchAr[1];
        searchKeywords = searchKeywords.replace(categoryMatchAr[0], "").trim(); // Remove category phrase from keywords
      } else if (categoryMatchEn) {
        detectedCategoryName = categoryMatchEn[1];
        searchKeywords = searchKeywords.replace(categoryMatchEn[0], "").trim(); // Remove category phrase from keywords
      }

      // Check for sort type mention (latest or discount)
      if (
        searchKeywords.includes(t("latest")) ||
        searchKeywords.includes("أحدث")
      ) {
        sortBy = "latest";
        searchKeywords = searchKeywords
          .replace(t("latest"), "")
          .replace("أحدث", "")
          .trim(); // Remove sort phrase from keywords
      } else if (
        // Check for cheapest discounted offers
        lowerUserMessage.includes(t("cheapest offers")) || // Assuming a translation key or add direct strings
        lowerUserMessage.includes("أرخص العروض") ||
        lowerUserMessage.includes("عروض بأقل سعر") ||
        lowerUserMessage.includes("cheapest discounted")
      ) {
        sortBy = "cheapest_discounted";
        // Remove sort phrase from keywords
        searchKeywords = searchKeywords
          .replace(t("cheapest offers"), "") // Need to add translation key or use direct strings
          .replace("أرخص العروض", "")
          .replace("عروض بأقل سعر", "")
          .replace("cheapest discounted", "")
          .trim();
      } else if (
        searchKeywords.includes(t("discount")) ||
        searchKeywords.includes("خصم") ||
        searchKeywords.includes("مخفضة") ||
        searchKeywords.includes("offers") ||
        searchKeywords.includes("عروض") ||
        searchKeywords.includes("تخفيضات")
      ) {
        sortBy = "discount";
        searchKeywords = searchKeywords
          .replace(t("discount"), "")
          .replace("خصم", "")
          .replace("مخفضة", "")
          .replace("offers", "")
          .replace("عروض", "")
          .replace("تخفيضات", "")
          .trim(); // Remove sort phrase from keywords
      }

      // Determine if product search is needed
      const isProductSearchNeeded =
        sortBy !== null || 
        detectedCategoryName !== null || 
        lowerUserMessage.includes("hp") ||
        lowerUserMessage.includes("apple") ||
        lowerUserMessage.includes("samsung") ||
        lowerUserMessage.includes("sony") ||
        lowerUserMessage.includes("dell") ||
        lowerUserMessage.includes("laptop") ||
        lowerUserMessage.includes("phone") ||
        lowerUserMessage.includes("tv") ||
        lowerUserMessage.includes("computer") ||
        lowerUserMessage.includes("حاسوب") ||
        lowerUserMessage.includes("لابتوب") ||
        lowerUserMessage.includes("هاتف") ||
        lowerUserMessage.includes("تلفزيون") ||
        lowerUserMessage.includes("كمبيوتر");

      let productSearchResults = null;
      let aiTextResponse = null;

      // --- Perform Product Search if Needed ---
      if (isProductSearchNeeded) {
        console.log("Performing product search for:", userMessage);
        productSearchResults = await searchProducts(
          userMessage, // Pass original query
          5,
          null, // categoryId is determined in searchProducts from name
          sortBy,
          detectedCategoryName // Pass detected category name
        );
        console.log("Search results:", productSearchResults);
      }

      // --- Get Conversational AI Response (based on search results if applicable) ---
      const conversationHistory = messages
        .slice(-6) // Only use last 6 messages for context
        .map((msg) => ({
          role: msg.isBot ? "assistant" : "user",
          content:
            typeof msg.text === "string" ? msg.text : msg.text?.text || "",
        }));

      let aiPrompt = userMessage;

      // Enhance AI prompt with information about search results if a search was performed
      if (isProductSearchNeeded) {
        if (productSearchResults && productSearchResults.length > 0) {
          const productTitles = productSearchResults
            .map(
              (p) =>
                p.title?.[i18n.language] ||
                p.title?.en ||
                p.title?.ar ||
                "product"
            )
            .join(", ");
          // Modify prompt to tell the AI about the successful search
          aiPrompt = `The user asked for "${userMessage}". The product search found ${productSearchResults.length} items including: ${productTitles}. Generate a conversational response that introduces these search results to the user.`;
        } else {
          // Modify prompt to tell the AI no products were found for the specific request
          aiPrompt = `The user asked for "${userMessage}". The product search found no items matching the specific request (category/sort). Generate a conversational response that apologizes for not finding products matching the request and perhaps suggests broadening the search.`;
        }
      } else {
        // If no product search was needed, use the original message for the AI prompt
        aiPrompt = userMessage;
      }

      // Get AI's text response using the possibly enhanced prompt
      aiTextResponse = await getChatbotResponseWithHistory(
        aiPrompt, // Use the possibly enhanced prompt
        conversationHistory,
        user?.uid || null,
        cart
      );

      // Add the AI's text response to messages
      if (productSearchResults && productSearchResults.length > 0) {
        // Create a message with both text and products
        setMessages((prev) => [
          ...prev,
          {
            text: aiTextResponse,
            isBot: true,
            products: productSearchResults
          }
        ]);
      } else {
        // Just add the text response
        setMessages((prev) => [
          ...prev,
          {
            text: aiTextResponse,
            isBot: true
          }
        ]);
      }
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
