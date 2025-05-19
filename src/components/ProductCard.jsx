import React, { useState, useEffect } from "react";
import { Card, Badge } from "react-bootstrap";
import { GiRoundStar } from "react-icons/gi";
import { FiEye, FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { FaShoppingBasket } from "react-icons/fa";
import ProductQuickViewModal from "./ProductQuickViewModal";
import "./styles.css";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../Store/Slices/cartSlice';
import { addToWishlist, addToLocalWishlist, removeFromWishlist, removeFromLocalWishlist } from '../Store/Slices/wishlistSlice';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { loading: cartLoading } = useSelector(state => state.cart);
  const wishlistItems = useSelector(state => state.wishlist.items);
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // Get the first variant if it's a variant product
  const firstVariant = product.productType === "variant" && product.variants?.[0];
  
  // Use variant data if available, otherwise use main product data
  const {
    title = firstVariant?.title || product.name,
    mainImage = firstVariant?.mainImage || product.mainImage,
    subCategoryId = product.subCategoryId,
    price = firstVariant?.price || product.price,
    discountPrice = firstVariant?.discountPrice || product.discountPrice,
    ratingSummary = product.ratingSummary,
    brandId = product.brandId,
    createdAt = product.createdAt,
    quantity = firstVariant?.quantity || product.quantity,
    images = firstVariant?.images || product.images || []
  } = product;

  const [imgSrc, setImgSrc] = useState(mainImage);
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if product is in wishlist
    const checkWishlist = () => {
      const isWishlisted = wishlistItems.some(item => item.id === product.id);
      setIsInWishlist(isWishlisted);
    };
    checkWishlist();
  }, [wishlistItems, product.id]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (images.length > 0 && images[0]) {
      setImgSrc(images[0]);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setImgSrc(mainImage);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error(currentLanguage === 'ar' ? "الرجاء تسجيل الدخول لإضافة منتجات إلى السلة!" : "Please login to add items to cart!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }

    if (quantity === 0) {
      toast.error(currentLanguage === 'ar' ? "هذا المنتج غير متوفر في المخزون!" : "This product is out of stock!", {
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
      toast.success(currentLanguage === 'ar' ? `تمت إضافة ${title?.[currentLanguage]} إلى السلة!` : `${title?.en} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error(currentLanguage === 'ar' ? "فشل في إضافة المنتج إلى السلة!" : "Failed to add to cart!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleWishlistToggle = () => {
    // if (!user) {
    //   toast.error(currentLanguage === 'ar' ? "الرجاء تسجيل الدخول لإضافة منتجات إلى المفضلة!" : "Please login to add items to wishlist!", {
    //     position: "top-right",
    //     autoClose: 3000,
    //   });
    //   navigate("/login");
    //   return;
    // }

    if (isInWishlist) {
      if (user) {
        dispatch(removeFromWishlist({ productId: product.id, userId: user.uid }));
        toast.success(currentLanguage === 'ar' ? `تمت إزالة ${title?.[currentLanguage]} من المفضلة!` : `${title?.en} removed from wishlist!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        dispatch(removeFromLocalWishlist(product.id));
        toast.success(currentLanguage === 'ar' ? `تمت إزالة ${title?.[currentLanguage]} من المفضلة!` : `${title?.en} removed from wishlist!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      if (user) {
        dispatch(addToWishlist({ product, userId: user.uid }));
        toast.success(currentLanguage === 'ar' ? `تمت إضافة ${title?.[currentLanguage]} إلى المفضلة!` : `${title?.en} added to wishlist!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        dispatch(addToLocalWishlist(product));
        toast.success(currentLanguage === 'ar' ? `تمت إضافة ${title?.[currentLanguage]} إلى المفضلة!` : `${title?.en} added to wishlist!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  // Check if product is new (less than 7 days old)
  const isNew = () => {
    const productDate = new Date(createdAt.seconds * 1000);
    const now = new Date();
    const diffTime = Math.abs(now - productDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <GiRoundStar
          key={i}
          style={{
            color: i <= rating ? "#f8bf87" : "#ccc",
          }}
        />
      );
    }
    return stars;
  };

  const handleTitleClick = () => {
    navigate(`/shop/${product.id}`);
  };

  return (
    <>
      <ToastContainer />
      <Card 
        className="h-100 shadow-sm product-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="image-wrapper">
          <Card.Img
            variant="top"
            src={imgSrc}
            alt={title?.[currentLanguage]}
            className={isHovered ? "zoom-img" : ""}
            style={{ 
              height: "250px", 
              objectFit: "contain", 
              transition: "all 0.5s ease-in-out"
            }}
          />
          <div style={{ position: "absolute", top: "10px", right: "10px" }}>
            {quantity === 0 ? (
              <Badge bg="danger">{currentLanguage === 'ar' ? "غير متوفر" : "OUT OF STOCK"}</Badge>
            ) : (
              <>
                {discountPrice ? (
                  <Badge bg="warning" text="dark">{currentLanguage === 'ar' ? "خصم" : "SALE"}</Badge>
                ) : isNew() && (
                  <Badge bg="success">{currentLanguage === 'ar' ? "جديد" : "NEW"}</Badge>
                )}
              </>
            )}
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 999, color: 'red' }}>
          </div>
          <div className="hover-icons">
            <button 
              className="icon-btn" 
              title={isInWishlist ? (currentLanguage === 'ar' ? "إزالة من المفضلة" : "Remove from Wishlist") : (currentLanguage === 'ar' ? "إضافة إلى المفضلة" : "Add to Wishlist")}
              onClick={handleWishlistToggle}
              style={{ color: isInWishlist ? "#ff4d4d" : "inherit" }}
            >
              {isInWishlist ? <FaHeart /> : <FiHeart />}
            </button>
            <button 
              className="icon-btn" 
              title={currentLanguage === 'ar' ? "عرض سريع" : "Quick View"} 
              onClick={() => setShowModal(true)}
            >
              <FiEye />
            </button>
            <button 
              className="icon-btn" 
              title={currentLanguage === 'ar' ? "إضافة إلى السلة" : "Add to Cart"}
              onClick={handleAddToCart}
              disabled={quantity === 0 || cartLoading}
              style={{ 
                opacity: quantity === 0 ? 0.5 : 1, 
                cursor: quantity === 0 ? 'not-allowed' : 'pointer' 
              }}
            >
              <FaShoppingBasket />
            </button>
          </div>
        </div>
        <Card.Body>
          <small className="text-muted d-block">{subCategoryId?.name?.[currentLanguage]}</small>
          <small className="text-muted d-block">{brandId?.name?.[currentLanguage] || 'Grabit'}</small>

          <Card.Title
            className="mt-1"
            style={{
              fontSize: "0.95rem",
              color: '#6c757d',
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
              transition: "color 0.2s ease"
            }}
            title={title?.[currentLanguage]} 
            onClick={handleTitleClick}
            onMouseEnter={(e) => e.target.style.color = "#5caf90"}
            onMouseLeave={(e) => e.target.style.color = "#4b5966"}
          >
            {title?.[currentLanguage]}
          </Card.Title>

          <div className="mb-2 d-flex">
            {renderStars(Math.floor(ratingSummary?.average || 0))}
          </div>

          <div className="fw-bold">
            {discountPrice && discountPrice > 0 ? (
              <>
                <span className="text-success">${discountPrice}</span>{" "}
                <del className="text-danger ms-2">${price}</del>
              </>
            ) : (
              <span>${price}</span>
            )}
          </div>
        </Card.Body>
        <ProductQuickViewModal
          show={showModal}
          onHide={() => setShowModal(false)}
          product={product}
          imgSrc={mainImage} 
          renderStars={renderStars}
        />
      </Card>
    </>
  );
};

export default ProductCard;
