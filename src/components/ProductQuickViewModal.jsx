import React, { useState, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { FaShoppingBasket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { addToCart } from "../Store/Slices/cartSlice";
// import { useAuth } from "../context/AuthContext";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const ProductQuickViewModal = ({
  show,
  onHide,
  product,
  imgSrc,
  renderStars,
}) => {
  const {i18n } = useTranslation();
  const currentLanguage = i18n.language;
  if (!product) return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = useNavigate();
  // const dispatch = useDispatch();  // eslint-disable-next-line react-hooks/rules-of-hooks

  

  // Get the first variant if it's a variant product
  const firstVariant =
    product.productType === "variant" && product.variants?.[0];

  // Use variant data if available, otherwise use main product data
  const {
    title = firstVariant?.title || product.title,
    price = firstVariant?.price || product.price,
    discountPrice = firstVariant?.discountPrice || product.discountPrice,
    ratingSummary = product.ratingSummary,
    description = firstVariant?.description || product.description,
    // quantity = firstVariant?.quantity || product.quantity,
  } = product;

  // Quantity state
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [zoom, setZoom] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [backgroundPosition, setBackgroundPosition] = useState("center");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const imgRef = useRef();

  // const handleQtyChange = (val) => {
  //   if (val < 1) return;
  //   setQty(val);
  // };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const viewProduct = () => {
    navigate(`/shop/${product.id}`);
  };

  // const handleAddToCart = async () => {
    // if (!user) {
    //   toast.error("Please login to add items to cart!", {
    //     position: "top-right",
    //     autoClose: 3000,
    //   });
    //   navigate("/login");
    //   return;
    // }
    // if (product.productType === "variant")
    // {
    //   navigate(`/shop/${product.id}`);
    //   return;
    // }

    // if (quantity === 0) {
    //   toast.error("This product is out of stock!", {
    //     position: "top-right",
    //     autoClose: 3000,
    //   });
    //   return;
    // }

  //   try {
  //     await dispatch(
  //       addToCart({
  //         userId: user.uid,
  //         productId: product.id,
  //         price: discountPrice || price,
  //         quantity: qty,
  //       })
  //     );
  //     toast.success(`${title?.en} added to cart!`, {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //     onHide();
  //     // eslint-disable-next-line no-unused-vars
  //   } catch (error) {
  //     toast.error("Failed to add to cart!", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //   }
  // };

  // Get current language (example: from browser)
  

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton onHide={onHide} />
        <Modal.Body>
          <div
            className="quickview-pro-content"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "24px",
              flexWrap: "wrap",
              padding: 0,
            }}
          >
            <div
              style={{
                flex: "0 0 230px",
                maxWidth: 230,
                height: 230,
                overflow: "hidden",
              }}
            >
              <div
                ref={imgRef}
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
                onMouseMove={handleMouseMove}
                style={{
                  width: "100%",
                  height: "100%",
                  maxWidth: 230,
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  background: "#fff",
                  cursor: "zoom-in",
                  backgroundImage: `url(${imgSrc})`,
                  backgroundSize: zoom ? "150%" : "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: zoom ? backgroundPosition : "center",
                  transition: "background-size 0.3s",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {!zoom && (
                  <img
                    src={imgSrc}
                    alt={title?.en}
                    style={{
                      width: "100%",
                      maxWidth: 230,
                      height: 230,
                      objectFit: "contain",
                      display: "block",
                      borderRadius: 8,
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>
            </div>
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <span
                onClick={() => navigate(`/shop/${product.id}`)}
                style={{
                  margin: "0px 0px 15px",
                  display: "block",
                  color: "#4b5966",
                  fontSize: 22,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {currentLanguage === "ar" ? title?.ar : title?.en}
              </span>
              <div style={{ margin: "8px 0" }}>
                {renderStars(Math.floor(ratingSummary?.average || 0))}
              </div>
              <div
                className="gi-quickview-desc"
                style={{
                  marginBottom: 10,
                  fontSize: 13,
                  lineHeight: "22px",
                  color: "#999",
                  fontWeight: 300,
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    currentLanguage === "ar"
                      ? description?.ar || "لا يوجد وصف"
                      : description?.en || "No description available.",
                }}
              />
              <div className="gi-quickview-price" style={{ marginBottom: 15 }}>
                {discountPrice && discountPrice > 0 ? (
                  <>
                    <span
                      className="new-price"
                      style={{
                        color: "#4b5966",
                        fontWeight: 700,
                        fontSize: 22,
                      }}
                    >
                      ${discountPrice}
                    </span>{" "}
                    <span
                      className="old-price"
                      style={{
                        fontSize: 18,
                        marginLeft: 10,
                        textDecoration: "line-through",
                        color: "#777",
                      }}
                    >
                      ${price}
                    </span>
                  </>
                ) : (
                  <span
                    className="new-price"
                    style={{ color: "#4b5966", fontWeight: 700, fontSize: 22 }}
                  >
                    ${price}
                  </span>
                )}
              </div>
              <div
                className="gi-quickview-qty"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                {/* <div
                  className="qty-plus-minus"
                  style={{
                    width: 100,
                    height: 43,
                    padding: 0,
                    border: "1px solid #eee",
                    overflow: "hidden",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 3,
                  }}
                >
                  <button
                    style={{
                      border: "none",
                      background: "none",
                      fontSize: 20,
                      width: 40,
                      height: 43,
                      cursor: "pointer",
                    }}
                    onClick={() => handleQtyChange(qty - 1)}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="qty-input"
                    style={{
                      width: 40,
                      height: 43,
                      margin: 0,
                      padding: 0,
                      background: "none",
                      color: "#777",
                      fontSize: 14,
                      border: "none",
                      textAlign: "center",
                      outline: "none",
                    }}
                    value={qty}
                    readOnly
                  />
                  <button
                    style={{
                      border: "none",
                      background: "none",
                      fontSize: 20,
                      width: 40,
                      height: 43,
                      cursor: "pointer",
                    }}
                    onClick={() => handleQtyChange(qty + 1)}
                  >
                    +
                  </button>
                </div> */}
                <div className="gi-quickview-cart">
                  <Button
                    className="gi-btn-1"
                    style={{
                      margin: "0 0 0 15px",
                      padding: "10px 15px",
                      borderRadius: 3,
                      backgroundColor: "#5caf90",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                    // disabled={quantity === 0 || cartLoading}
                    onClick={viewProduct}
                  >
                    {currentLanguage === "ar" ? " عرض المنتج " : "View Product"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProductQuickViewModal;
