import React from 'react';
import ChatbotProductCard from './ChatbotProductCard';
import './ChatbotProductCard.css';

const ChatbotProductsDisplay = ({ products, layout = 'list' }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={layout === 'grid' ? 'chatbot-products-grid' : 'chatbot-products-list'}>
      {products.map(product => (
        <ChatbotProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ChatbotProductsDisplay;