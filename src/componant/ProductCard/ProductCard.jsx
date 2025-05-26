import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../Store/Slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../store/Slices/wishlistSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (product.productTyp === "variant") {
      navigate(`/shop/${product.id}`);
      return;
    }
    // Build a complete cartItem object for simple products
    const cartItem = {
      userId: user.uid, // Assuming userId is needed in the slice
      productId: product.id,
      itemQuantity: 1,
      // Include relevant product details for display in cart
      title: product.title || { [i18n.language]: product.name || "Product" }, // Use localized title object or fallback
      mainImage: product.mainImage,
      price: product.discountPrice || product.price, // Use discounted price if available
      originalPrice: product.price, // Original price
      quantity: product.quantity, // Stock quantity
      productType: "simple", // Explicitly mark as simple product
      // No variantId or variantAttributes for simple products
    };

    // Remove any properties with undefined values
    Object.keys(cartItem).forEach((key) => {
      if (cartItem[key] === undefined) {
        delete cartItem[key];
      }
    });

    dispatch(addToCart(cartItem));
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const handleProductClick = () => {
    navigate(`/shop/${product.id}`);
  };

  // Get localized title and description
  const title = i18n.language === "ar" ? product.title?.ar : product.title?.en;
  const description =
    i18n.language === "ar" ? product.description?.ar : product.description?.en;

  return (
    <Card className="product-card h-100">
      <div className="product-image-container" onClick={handleProductClick}>
        <Card.Img
          variant="top"
          src={product.mainImage}
          alt={title || t("common.unknownProduct")}
          className="product-image"
        />
        {product.discount > 0 && (
          <Badge bg="danger" className="discount-badge">
            -{product.discount}%
          </Badge>
        )}
        <Button
          variant="light"
          className="wishlist-button"
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle();
          }}
        >
          <i className={`bi bi-heart${isInWishlist ? "-fill" : ""}`}></i>
        </Button>
      </div>
      <Card.Body>
        <Card.Title className="product-title" onClick={handleProductClick}>
          {title || t("common.unknownProduct")}
        </Card.Title>
        <Card.Text className="product-description">
          {description || t("common.noDescription")}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {product.discount > 0 ? (
              <>
                <span className="original-price">
                  ${product.price.toFixed(2)}
                </span>
                <span className="discounted-price">
                  ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="price">${product.price.toFixed(2)}</span>
            )}
          </div>
          <Button
            variant="primary"
            className="add-to-cart-button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            {t("common.addToCart")}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
