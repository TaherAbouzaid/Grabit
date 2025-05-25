import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchProductById } from "../services/productService";
import { incrementProductViews } from "../services/productStatsService"; // تصحيح مسار الاستيراد
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../Store/Slices/cartSlice";
import { addReview, getProductReviews } from "../Store/Slices/reviewSlice";
import { showToast } from "../components/SimpleToastUtils";

const NextArrow = (props) => (
  <div
    {...props}
    style={{
      ...props.style,
      display: "block",
      position: "absolute",
      right: -20,
      zIndex: 2,
      top: "50%",
      transform: "translateY(-50%)",
    }}
  >
    <FaChevronRight size={22} color="#5caf90" />
  </div>
);

const PrevArrow = (props) => (
  <div
    {...props}
    style={{
      ...props.style,
      display: "block",
      position: "absolute",
      left: -20,
      zIndex: 2,
      top: "50%",
      transform: "translateY(-50%)",
    }}
  >
    <FaChevronLeft size={22} color="#5caf90" />
  </div>
);

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const reviews = useSelector((state) => state.reviews.items);
  const reviewsLoading = useSelector((state) => state.reviews.loading);
  const cartLoading = useSelector((state) => state.cart.loading);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        console.log("Fetching product with ID:", productId);
        const productData = await fetchProductById(productId);
        console.log("Fetched product data:", productData);

        if (productData) {
          setProduct(productData);

          // زيادة عدد المشاهدات
          await incrementProductViews(productId);

          // If it's a variant product, set the first variant's data
          if (
            productData.productType === "variant" &&
            productData.variants?.length > 0
          ) {
            const firstVariant = productData.variants[0];
            setSelectedVariant(firstVariant);
            setMainImg(firstVariant.mainImage);

            // Set initial attributes from first variant
            const initialAttributes = {};
            firstVariant.attributes?.forEach((attr) => {
              initialAttributes[attr.key] = attr.value.split(",")[0].trim();
            });
            setSelectedAttributes(initialAttributes);
          } else {
            setMainImg(productData.mainImage);
          }
        } else {
          console.log("No product data found for ID:", productId);
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      }
      setLoading(false);
    };

    fetchProduct();
    console.log("Dispatching getProductReviews for ID:", productId);
    dispatch(getProductReviews(productId));
  }, [productId, dispatch]);

  // Get available values for an attribute based on current selections
  const getAvailableAttributeValues = (attributeKey) => {
    if (!product?.variants) return [];
    const values = new Set();

    // Filter variants based on currently selected attributes
    const filteredVariants = product.variants.filter((variant) => {
      return variant.attributes?.every((attr) => {
        // Skip the current attribute we're checking
        if (attr.key === attributeKey) return true;
        // Check if the variant has the currently selected value for other attributes
        return (
          selectedAttributes[attr.key] &&
          attr.value
            .split(",")
            .map((v) => v.trim())
            .includes(selectedAttributes[attr.key])
        );
      });
    });

    // Get unique values from filtered variants
    filteredVariants.forEach((variant) => {
      const attr = variant.attributes?.find(
        (attr) => attr.key === attributeKey
      );
      if (attr) {
        attr.value.split(",").forEach((value) => values.add(value.trim()));
      }
    });

    return Array.from(values);
  };

  // Get variants that match all currently selected attributes
  const getMatchingVariants = (attributeKey, attributeValue) => {
    if (!product?.variants) return [];
    return product.variants.filter((variant) => {
      return variant.attributes?.every((attr) => {
        if (attr.key === attributeKey) {
          return attr.value
            .split(",")
            .map((v) => v.trim())
            .includes(attributeValue);
        }
        return (
          selectedAttributes[attr.key] &&
          attr.value
            .split(",")
            .map((v) => v.trim())
            .includes(selectedAttributes[attr.key])
        );
      });
    });
  };

  const handleAttributeChange = (attributeKey, attributeValue) => {
    // Create a new attributes object with the updated value
    const newAttributes = {
      ...selectedAttributes,
      [attributeKey]: attributeValue,
    };

    // Find all variants that match the new selection
    const matchingVariants = product.variants.filter((variant) => {
      return variant.attributes?.every((attr) => {
        const selectedValue = newAttributes[attr.key];
        return (
          selectedValue &&
          attr.value
            .split(",")
            .map((v) => v.trim())
            .includes(selectedValue)
        );
      });
    });

    // Update attributes to only include values that are available in matching variants
    const updatedAttributes = { ...newAttributes };
    getAttributeKeys().forEach((key) => {
      if (key !== attributeKey) {
        const availableValues = new Set();
        matchingVariants.forEach((variant) => {
          const attr = variant.attributes?.find((attr) => attr.key === key);
          if (attr) {
            attr.value
              .split(",")
              .forEach((value) => availableValues.add(value.trim()));
          }
        });

        // If current selection is not available in matching variants, clear it
        if (!availableValues.has(updatedAttributes[key])) {
          delete updatedAttributes[key];
        }
      }
    });

    setSelectedAttributes(updatedAttributes);

    // Find first variant that matches all selected attributes
    const firstMatchingVariant = matchingVariants[0];
    if (firstMatchingVariant) {
      setSelectedVariant(firstMatchingVariant);
      setMainImg(firstMatchingVariant.mainImage);
    }
  };

  // Get all unique attribute keys from variants
  const getAttributeKeys = () => {
    if (!product?.variants) return [];
    const keys = new Set();
    product.variants.forEach((variant) => {
      variant.attributes?.forEach((attr) => keys.add(attr.key));
    });
    return Array.from(keys);
  };

  // Check if an attribute value is available with current selections
  const isAttributeValueAvailable = (attributeKey, attributeValue) => {
    return getAvailableAttributeValues(attributeKey).includes(attributeValue);
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      // استخدام SimpleToast بدلاً من toast
      showToast(
        currentLanguage === "ar"
          ? "الرجاء تسجيل الدخول لكتابة مراجعة!"
          : "Please login to write a review!",
        "error"
      );
      navigate("/login");
      return;
    }

    if (rating === 0) {
      showToast(
        currentLanguage === "ar"
          ? "الرجاء اختيار تقييم!"
          : "Please select a rating!",
        "error"
      );
      return;
    }

    if (!review.trim()) {
      showToast(
        currentLanguage === "ar"
          ? "الرجاء كتابة مراجعة!"
          : "Please write a review!",
        "error"
      );
      return;
    }

    try {
      await dispatch(
        addReview({
          productId,
          userId: user.uid,
          userName: user.displayName || user.email?.split("@")[0] || "User",
          rating,
          comment: review.trim(),
        })
      ).unwrap();

      showToast(
        currentLanguage === "ar"
          ? "تم إرسال المراجعة بنجاح!"
          : "Review submitted successfully!",
        "success"
      );
      setShowReviewForm(false);
      setRating(0);
      setReview("");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showToast(
        currentLanguage === "ar"
          ? "فشل في إرسال المراجعة. يرجى المحاولة مرة أخرى."
          : "Failed to submit review. Please try again.",
        "error"
      );
    }
  };

  const renderReviewStars = (rating, isInteractive = false) => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={isInteractive ? "cursor-pointer" : ""}
            style={{
              color:
                star <= (isInteractive ? hoveredRating || rating : rating)
                  ? "#f8bf87"
                  : "#ccc",
              fontSize: isInteractive ? "1.5rem" : "1rem",
              marginRight: "2px",
              cursor: isInteractive ? "pointer" : "default",
              transition: "color 0.2s ease",
            }}
            onClick={() => isInteractive && setRating(star)}
            onMouseEnter={() => isInteractive && setHoveredRating(star)}
            onMouseLeave={() => isInteractive && setHoveredRating(0)}
          />
        ))}
      </div>
    );
  };

  const handleAddToCart = async () => {
    if (!user) {
      // استخدام SimpleToast بدلاً من toast
      showToast(
        currentLanguage === "ar"
          ? "الرجاء تسجيل الدخول لإضافة منتجات إلى السلة!"
          : "Please login to add items to cart!",
        "error"
      );
      navigate("/login");
      return;
    }

    if (getCurrentQuantity() === 0) {
      // استخدام SimpleToast بدلاً من toast
      showToast(
        currentLanguage === "ar"
          ? "هذا المنتج غير متوفر في المخزون!"
          : "This product is out of stock!",
        "error"
      );
      return;
    }

    try {
      const cartItem = {
        userId: user.uid,
        productId: product.id,
        quantity: 1,
        subCategoryId: product.subCategoryId,
        brandId: product.brandId,
        productType: product.productType,
      };

      // Add variant information if it's a variant product
      if (product.productType === "variant" && selectedVariant) {
        cartItem.variantId = selectedVariant.id;
        cartItem.variantAttributes = selectedAttributes;
        // Ensure variant title is stored as a translation object { ar: '...', en: '...' }
        if (selectedVariant.title) {
          cartItem.title =
            typeof selectedVariant.title === "object" &&
            selectedVariant.title !== null
              ? selectedVariant.title
              : { [currentLanguage]: selectedVariant.title }; // Create object if it's a string
        } else {
          cartItem.title = { [currentLanguage]: "Product Variant" }; // Default if title is missing
        }

        cartItem.mainImage = selectedVariant.mainImage;
        cartItem.quantity = selectedVariant.quantity;
        cartItem.price = selectedVariant.discountPrice || selectedVariant.price;
        cartItem.originalPrice = selectedVariant.price;
        cartItem.images = selectedVariant.images || [];
      } else {
        // For simple products
        // Ensure simple product title is stored as a translation object { ar: '...', en: '...' }
        if (product.title) {
          cartItem.title =
            typeof product.title === "object" && product.title !== null
              ? product.title
              : { [currentLanguage]: product.title }; // Create object if it's a string
        } else if (product.name) {
          cartItem.title =
            typeof product.name === "object" && product.name !== null
              ? product.name
              : { [currentLanguage]: product.name }; // Handle product.name as fallback
        } else {
          cartItem.title = { [currentLanguage]: "Product" }; // Default if both are missing
        }

        cartItem.mainImage = product.mainImage;
        cartItem.quantity = product.quantity;
        cartItem.price = product.discountPrice || product.price;
        cartItem.originalPrice = product.price;
        cartItem.images = product.images || [];
      }

      console.log("Adding to cart:", cartItem); // للتأكد من البيانات
      await dispatch(addToCart(cartItem));
      // استخدام SimpleToast بدلاً من toast
      showToast(
        currentLanguage === "ar"
          ? `تمت إضافة ${
              cartItem.title?.[currentLanguage] ||
              cartItem.title?.en ||
              "المنتج"
            } إلى السلة!`
          : `${
              cartItem.title?.[currentLanguage] ||
              cartItem.title?.en ||
              "Product"
            } added to cart!`,
        "success"
      );
    } catch (error) {
      console.error("Error adding to cart:", error); // للتأكد من الأخطاء
      // استخدام SimpleToast بدلاً من toast
      showToast(
        currentLanguage === "ar"
          ? "فشل في إضافة المنتج إلى السلة!"
          : "Failed to add to cart!",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center my-5">Product not found</div>;
  }

  const allImages = selectedVariant?.images || [
    product.mainImage,
    ...(product.images || []),
  ];

  const sliderSettings = {
    slidesToShow: Math.min(4, allImages.length),
    slidesToScroll: 1,
    arrows: allImages.length > 4,
    infinite: allImages.length > 4,
    className: "w-100",
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  // Get the current price based on whether it's a variant or simple product
  const getCurrentPrice = () => {
    if (product.productType === "variant" && selectedVariant) {
      return selectedVariant.discountPrice || selectedVariant.price;
    }
    return product.discountPrice || product.price;
  };

  const getOriginalPrice = () => {
    if (product.productType === "variant" && selectedVariant) {
      return selectedVariant.price;
    }
    return product.price;
  };

  const getCurrentTitle = () => {
    if (product.productType === "variant" && selectedVariant) {
      return (
        selectedVariant.title?.[currentLanguage] || selectedVariant.title?.en
      );
    }
    return (
      product.title?.[currentLanguage] ||
      product.title?.en ||
      product.name?.[currentLanguage] ||
      product.name?.en
    );
  };

  const getCurrentQuantity = () => {
    if (product.productType === "variant" && selectedVariant) {
      return selectedVariant.quantity;
    }
    return product.quantity;
  };

  return (
    <div className="container my-5">
      <div className="row g-4 align-items-start">
        <div className="col-12 col-md-6 col-lg-6">
          <div
            className="d-flex flex-column align-items-between justify-content-start h-100"
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              background: "#fff",
              padding: 24,
              minHeight: 620,
              maxHeight: 620,
              minWidth: 0,
              maxWidth: "100%",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              className="w-100 mb-3"
              style={{
                textAlign: "center",
                minHeight: 440,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <img
                src={mainImg}
                alt={getCurrentTitle()}
                style={{
                  maxWidth: 380,
                  maxHeight: 740,
                  minHeight: 640,
                  objectFit: "cover",
                  width: "100%",
                  background: "#fff",
                  transition: "transform 0.3s ease",
                  cursor: "zoom-in",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              />
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Slider {...sliderSettings}>
                {allImages.map((img, idx) => (
                  <div key={idx} className="px-1">
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      onClick={() => setMainImg(img)}
                      onMouseEnter={(e) => {
                        if (img !== mainImg) {
                          e.target.style.border = "2px solid #5caf90";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (img !== mainImg) {
                          e.target.style.border = "none";
                        }
                      }}
                      style={{
                        width: 70,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: img === mainImg ? "2px solid #5caf90" : "none",
                        cursor: "pointer",
                        background: "#fff",
                        margin: "0 auto",
                        position: "relative",
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                        WebkitFocusRingColor: "transparent",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                        WebkitTouchCallout: "none",
                        WebkitUserDrag: "none",
                        KhtmlUserSelect: "none",
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-6">
          <div
            className="h-100 d-flex flex-column justify-content-start"
            style={{ minWidth: 0 }}
          >
            <h2
              style={{
                margin: "0 0 15px",
                color: "#4b5966",
                fontSize: 28,
                fontWeight: 600,
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {getCurrentTitle()}
            </h2>

            <div className="mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <FaStar
                  key={i}
                  color={
                    i <= Math.round(product?.ratingSummary?.average || 0)
                      ? "#f8bf87"
                      : "#ccc"
                  }
                  style={{ marginRight: 2 }}
                />
              ))}
              {product?.ratingSummary?.count > 0 && (
                <small className="text-muted ms-2">
                  ({product.ratingSummary.count}{" "}
                  {currentLanguage === "ar" ? "تقييمات" : "reviews"})
                </small>
              )}
            </div>

            <div style={{ margin: "15px 0", fontSize: 22, fontWeight: 700 }}>
              {getCurrentPrice() && getCurrentPrice() > 0 ? (
                <>
                  <span style={{ color: "#5caf90" }}>${getCurrentPrice()}</span>
                  {getOriginalPrice() > getCurrentPrice() && (
                    <span
                      style={{
                        color: "#999",
                        textDecoration: "line-through",
                        fontSize: 18,
                        marginLeft: 10,
                      }}
                    >
                      ${getOriginalPrice()}
                    </span>
                  )}
                </>
              ) : (
                <span>
                  {currentLanguage === "ar"
                    ? "السعر غير متوفر"
                    : "Price not available"}
                </span>
              )}
            </div>

            <div
              style={{
                margin: "10px 0",
                color: getCurrentQuantity() > 0 ? "#5caf90" : "#d9534f",
                fontWeight: 500,
              }}
            >
              {getCurrentQuantity() > 0
                ? currentLanguage === "ar"
                  ? `متوفر (${getCurrentQuantity()})`
                  : `In Stock (${getCurrentQuantity()})`
                : currentLanguage === "ar"
                ? "غير متوفر"
                : "Out of Stock"}
            </div>

            {/* Product Description */}
            <div className="mb-4">
              <h5 className="mb-3">
                {currentLanguage === "ar" ? "الوصف" : "Description"}
              </h5>
              <div
                style={{
                  color: "#666",
                  lineHeight: 1.6,
                  maxWidth: "100%",
                  overflow: "hidden",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      product.description?.[currentLanguage] ||
                      product.description?.en ||
                      (currentLanguage === "ar"
                        ? "لا يوجد وصف متوفر"
                        : "No description available"),
                  }}
                />
              </div>
            </div>

            {product.productType === "variant"
              ? // Variant Product Selection
                getAttributeKeys().map((attributeKey) => (
                  <div key={attributeKey} className="mb-4">
                    <h5 className="mb-3">
                      {currentLanguage === "ar" ? "اختر" : "Select"}{" "}
                      {attributeKey.charAt(0).toUpperCase() +
                        attributeKey.slice(1)}
                    </h5>
                    <div className="d-flex flex-wrap gap-2">
                      {getAvailableAttributeValues(attributeKey).map(
                        (value) => {
                          const matchingVariants = getMatchingVariants(
                            attributeKey,
                            value
                          );
                          const firstMatchingVariant = matchingVariants[0];

                          return (
                            <div
                              key={value}
                              className="attribute-option"
                              style={{
                                position: "relative",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                handleAttributeChange(attributeKey, value)
                              }
                            >
                              {attributeKey.toLowerCase() === "color" &&
                              firstMatchingVariant?.mainImage ? (
                                // Show image only for color attribute
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    border:
                                      selectedAttributes[attributeKey] === value
                                        ? "2px solid #5caf90"
                                        : "1px solid #ddd",
                                    overflow: "hidden",
                                    position: "relative",
                                  }}
                                >
                                  <img
                                    src={firstMatchingVariant.mainImage}
                                    alt={value}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              ) : (
                                // Show button for all other attributes
                                <button
                                  className={`btn ${
                                    selectedAttributes[attributeKey] === value
                                      ? "btn-success"
                                      : "btn-outline-success"
                                  }`}
                                  disabled={
                                    !isAttributeValueAvailable(
                                      attributeKey,
                                      value
                                    )
                                  }
                                >
                                  {value}
                                </button>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))
              : null}

            {/* Add to Cart Button */}
            <button
              className="btn btn-success btn-lg w-100"
              disabled={
                (product.productType === "variant" &&
                  Object.keys(selectedAttributes).length === 0) ||
                getCurrentQuantity() === 0 ||
                cartLoading
              }
              onClick={handleAddToCart}
            >
              {cartLoading
                ? currentLanguage === "ar"
                  ? "جاري الإضافة..."
                  : "Adding..."
                : currentLanguage === "ar"
                ? "إضافة إلى السلة"
                : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title mb-4">
                {currentLanguage === "ar"
                  ? "تقييمات العملاء"
                  : "Customer Reviews"}
              </h3>

              {/* Review Form */}
              <div className="mb-4">
                {user ? (
                  <button
                    className="btn btn-outline-success"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    {showReviewForm
                      ? currentLanguage === "ar"
                        ? "إلغاء التقييم"
                        : "Cancel Review"
                      : currentLanguage === "ar"
                      ? "كتابة تقييم"
                      : "Write a Review"}
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-success"
                    onClick={() => navigate("/login")}
                  >
                    {currentLanguage === "ar"
                      ? "تسجيل الدخول لكتابة تقييم"
                      : "Login to Write a Review"}
                  </button>
                )}

                {showReviewForm && (
                  <div className="mt-3 p-3 border rounded">
                    <div className="mb-3">
                      <label className="form-label">
                        {currentLanguage === "ar" ? "التقييم" : "Rating"}
                      </label>
                      {renderReviewStars(rating, true)}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        {currentLanguage === "ar" ? "تقييمك" : "Your Review"}
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder={
                          currentLanguage === "ar"
                            ? "اكتب تقييمك هنا..."
                            : "Write your review here..."
                        }
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success"
                        onClick={handleReviewSubmit}
                        disabled={reviewsLoading}
                      >
                        {reviewsLoading
                          ? currentLanguage === "ar"
                            ? "جاري الإرسال..."
                            : "Submitting..."
                          : currentLanguage === "ar"
                          ? "إرسال التقييم"
                          : "Submit Review"}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setShowReviewForm(false);
                          setRating(0);
                          setReview("");
                        }}
                      >
                        {currentLanguage === "ar" ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Reviews */}
              <div className="reviews-list">
                {reviewsLoading ? (
                  <div className="text-center">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="review-item border-bottom pb-3 mb-3"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong>{review.userName}</strong>
                          <small className="text-muted ms-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        {renderReviewStars(review.rating)}
                      </div>
                      <p className="mb-0">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">
                    {currentLanguage === "ar"
                      ? "لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!"
                      : "No reviews yet. Be the first to review this product!"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
