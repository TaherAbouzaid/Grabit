import React, { useState } from "react";
import { Card, Badge } from "react-bootstrap";
import { GiRoundStar } from "react-icons/gi";
import {  FiEye, FiHeart } from "react-icons/fi";
import { FaShoppingBasket } from "react-icons/fa";
import ProductQuickViewModal from "./ProductQuickViewModal";
import "./styles.css";
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
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
    <Card 
      className="h-100 shadow-sm product-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="image-wrapper">
        <Card.Img
          variant="top"
          src={imgSrc}
          alt={title?.en}
          className={isHovered ? "zoom-img" : ""}
          style={{ 
            height: "250px", 
            objectFit: "contain", 
            transition: "all 0.5s ease-in-out"
          }}
        />
        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
          {quantity === 0 ? (
            <Badge bg="danger">OUT OF STOCK</Badge>
          ) : (
            <>
              {discountPrice ? (
                <Badge bg="warning" text="dark">SALE</Badge>
              ) : isNew() && (
                <Badge bg="success">NEW</Badge>
              )}
            </>
          )}
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 999, color: 'red' }}>
        </div>
        <div className="hover-icons">
          <button className="icon-btn" title="Add to Wishlist">
            <FiHeart />
          </button>
          <button className="icon-btn" title="Quick View" onClick={() => setShowModal(true)}>
            <FiEye />
          </button>
          <button 
            className="icon-btn" 
            title="Add to Cart"
            disabled={quantity === 0}
            style={{ opacity: quantity === 0 ? 0.5 : 1, cursor: quantity === 0 ? 'not-allowed' : 'pointer' }}
          >
            <FaShoppingBasket />
          </button>
        </div>
      </div>
      <Card.Body>
        <small className="text-muted d-block">{subCategoryId?.name?.en}</small>
        <small className="text-muted d-block">{brandId?.name?.en || 'Grabit'}</small>

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
          title={title?.en} 
          onClick={handleTitleClick}
          onMouseEnter={(e) => e.target.style.color = "#5caf90"}
          onMouseLeave={(e) => e.target.style.color = "#4b5966"}
        >
          {title?.en}
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
  );
};

export default ProductCard;
