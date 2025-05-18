import React from 'react';
import { FaStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const ProductCardHorizontal = ({ product }) => {
  const navigate = useNavigate();
  const firstVariant = product.productType === "variant" && product.variants?.[0];
  
  const getTitle = () => {
    if (product.productType === "variant" && firstVariant) {
      return firstVariant.title?.en || firstVariant.title?.ar;
    }
    return product.title?.en || product.title?.ar || product.name?.en || product.name?.ar;
  };

  const getPrice = () => {
    if (product.productType === "variant" && firstVariant) {
      return firstVariant.discountPrice || firstVariant.price;
    }
    return product.discountPrice || product.price;
  };

  const getOriginalPrice = () => {
    if (product.productType === "variant" && firstVariant) {
      return firstVariant.price;
    }
    return product.price;
  };

  const getQuantity = () => {
    if (product.productType === "variant" && firstVariant) {
      return firstVariant.quantity;
    }
    return product.quantity;
  };

  const getImage = () => {
    if (product.productType === "variant" && firstVariant) {
      return firstVariant.mainImage;
    }
    return product.mainImage;
  };

  const handleTitleClick = () => {
    navigate(`/shop/${product.id}`);
  };

  return (
    <div className="card h-100" style={{ border: "1px solid #eee", borderRadius: 12 }}>
      <div className="row g-0 h-100">
        <div className="col-4" style={{ 
          borderRight: "1px solid #eee",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <img
            src={getImage()}
            alt={getTitle()}
            className="img-fluid"
            style={{
              maxHeight: 200,
              objectFit: "contain",
              width: "100%"
            }}
          />
        </div>
        <div className="col-8" style={{ padding: "1rem" }}>
          <div className="d-flex flex-column h-100">
            <h5 
              className="card-title mb-2" 
              style={{ 
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#4b5966",
                margin: 0,
                cursor: "pointer",
                transition: "color 0.2s ease"
              }}
              onClick={handleTitleClick}
              onMouseEnter={(e) => e.target.style.color = "#5caf90"}
              onMouseLeave={(e) => e.target.style.color = "#4b5966"}
            >
              {getTitle()}
            </h5>
            
            <div className="mb-2">
              {[1,2,3,4,5].map(i => (
                <FaStar
                  key={i}
                  color={i <= Math.round(product.ratingSummary?.average || 0) ? "#f8bf87" : "#ccc"}
                  style={{ marginRight: 2, fontSize: "0.9rem" }}
                />
              ))}
            </div>

            <div className="mb-2" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              <span style={{ color: "#5caf90" }}>
                ${getPrice()}
              </span>
              {getOriginalPrice() > getPrice() && (
                <span style={{
                  color: "#999",
                  textDecoration: "line-through",
                  fontSize: "1rem",
                  marginLeft: 10
                }}>
                  ${getOriginalPrice()}
                </span>
              )}
            </div>

            <div style={{ 
              color: getQuantity() > 0 ? "#5caf90" : "#d9534f",
              fontSize: "0.9rem",
              marginBottom: "auto"
            }}>
              {getQuantity() > 0 ? `In Stock (${getQuantity()})` : "Out of Stock"}
            </div>

            <button 
              className="btn btn-success mt-2"
              disabled={getQuantity() <= 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardHorizontal; 