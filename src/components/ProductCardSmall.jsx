import React from "react";
import { Card } from "react-bootstrap";
import { FaShoppingBasket } from "react-icons/fa";
import "./styles.css";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../Store/Slices/cartSlice';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductCardSmall = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading: cartLoading } = useSelector(state => state.cart);

  // Get the first variant if it's a variant product
  const firstVariant = product.productType === "variant" && product.variants?.[0];
  
  // Use variant data if available, otherwise use main product data
  const {
    title = firstVariant?.title || product.title,
    mainImage = firstVariant?.mainImage || product.mainImage,
    subCategoryId = product.subCategoryId,
    price = firstVariant?.price || product.price,
    discountPrice = firstVariant?.discountPrice || product.discountPrice,
    quantity = firstVariant?.quantity || product.quantity
  } = product;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }

    if (quantity === 0) {
      toast.error("This product is out of stock!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      await dispatch(addToCart({ 
        userId: user.uid, 
        productId: product.id, 
        price: discountPrice || price
      }));
      toast.success(`${title?.en} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to add to cart!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <Card 
        className="product-card-small shadow-sm product-card-small-hover" 
        style={{ 
          border: '1px solid #ececec', 
          borderRadius: 12, 
          position: 'relative', 
          overflow: 'visible',
          cursor: 'pointer'
        }}
        onClick={handleAddToCart}
      >
        <div className="d-flex align-items-center p-3">
          <div className="product-card-small-img me-3">
            <img
              src={mainImage}
              alt={title?.en}
              style={{ width: 60, height: 60, objectFit: "contain" }}
            />
          </div>
          <div className="flex-grow-1">
            <div
              className="product-card-small-title mb-1"
              title={title?.en}
              style={{ fontSize: 14, fontWeight: 600, color: '#6c757d', lineHeight: 1.2, marginBottom: 3 }}
            >
              {title?.en}
            </div>
            <div className="product-card-small-category mb-2" style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>
              {subCategoryId?.name?.en}
            </div>
            <div className="product-card-small-prices" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="product-card-small-price-new" style={{ color: '#495057', fontWeight: 700, fontSize: 15 }}>
                ${discountPrice || price}
              </span>
              {discountPrice && price > discountPrice && (
                <span className="product-card-small-price-old ms-2" style={{ color: '#888', fontSize: 11, textDecoration: 'line-through', fontWeight: 400 }}>
                  ${price}
                </span>
              )}
            </div>
          </div>
        </div>
        <div 
          className="product-card-small-basket-icon" 
          style={{ 
            opacity: quantity === 0 || cartLoading ? 0.5 : 1,
            cursor: quantity === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          <FaShoppingBasket size={16} color="#5caf90" />
        </div>
      </Card>
    </>
  );
};

export default ProductCardSmall; 