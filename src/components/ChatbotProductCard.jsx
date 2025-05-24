import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDispatch } from 'react-redux';
import { addToCart } from '../Store/Slices/cartSlice';
import { showToast } from './SimpleToastUtils';
import './ChatbotProductCard.css';

const ChatbotProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();

  // استخراج بيانات المنتج
  const {
    id,
    title,
    mainImage,
    price,
    discountPrice,
    quantity = 1
  } = product;

  const productTitle = title?.[currentLanguage] || title?.en || title?.ar || 'منتج';
  const finalPrice = discountPrice || price;
  const hasDiscount = discountPrice && discountPrice < price;

  const handleProductClick = () => {
    navigate(`/shop/${id}`);
  };

  const handleAddToCart = async () => {
    if (!user) {
      showToast(
        currentLanguage === 'ar' 
          ? "الرجاء تسجيل الدخول لإضافة منتجات إلى السلة!" 
          : "Please login to add items to cart!", 
        "error"
      );
      navigate("/login");
      return;
    }

    if (quantity === 0) {
      showToast(
        currentLanguage === 'ar' 
          ? "هذا المنتج غير متوفر في المخزون!" 
          : "This product is out of stock!", 
        "error"
      );
      return;
    }

    try {
      await dispatch(addToCart({ 
        userId: user.uid, 
        productId: id, 
        price: finalPrice 
      }));
      showToast(
        currentLanguage === 'ar' 
          ? `تمت إضافة ${productTitle} إلى السلة!` 
          : `${productTitle} added to cart!`, 
        "success"
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast(
        currentLanguage === 'ar' 
          ? "فشل في إضافة المنتج إلى السلة!" 
          : "Failed to add to cart!", 
        "error"
      );
    }
  };

  return (
    <div className="chatbot-product-card">
      <div className="chatbot-product-image" onClick={handleProductClick}>
        <img src={mainImage} alt={productTitle} />
        {hasDiscount && (
          <div className="chatbot-product-discount">
            {currentLanguage === 'ar' ? 'خصم' : 'SALE'}
          </div>
        )}
      </div>
      <div className="chatbot-product-info">
        <h4 className="chatbot-product-title" onClick={handleProductClick}>{productTitle}</h4>
        <div className="chatbot-product-price">
          {hasDiscount ? (
            <>
              <span className="chatbot-product-final-price">${discountPrice}</span>
              <span className="chatbot-product-original-price">${price}</span>
            </>
          ) : (
            <span className="chatbot-product-final-price">${price}</span>
          )}
        </div>
        <button 
          className="chatbot-product-add-btn"
          onClick={handleAddToCart}
          disabled={quantity === 0}
        >
          {currentLanguage === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ChatbotProductCard;