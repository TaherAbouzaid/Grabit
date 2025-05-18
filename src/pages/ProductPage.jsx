import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchProductById } from "../services/productService";

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
      transform: "translateY(-50%)"
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
      transform: "translateY(-50%)"
    }}
  >
    <FaChevronLeft size={22} color="#5caf90" />
  </div>
);

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await fetchProductById(productId);
        if (productData) {
          setProduct(productData);
          
          // If it's a variant product, set the first variant's data
          if (productData.productType === "variant" && productData.variants?.length > 0) {
            const firstVariant = productData.variants[0];
            setSelectedVariant(firstVariant);
            setMainImg(firstVariant.mainImage);
            
            // Set initial attributes from first variant
            const initialAttributes = {};
            firstVariant.attributes?.forEach(attr => {
              initialAttributes[attr.key] = attr.value.split(",")[0].trim();
            });
            setSelectedAttributes(initialAttributes);
          } else {
            setMainImg(productData.mainImage);
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  // Get available values for an attribute based on current selections
  const getAvailableAttributeValues = (attributeKey) => {
    if (!product?.variants) return [];
    const values = new Set();
    
    // Filter variants based on currently selected attributes
    const filteredVariants = product.variants.filter(variant => {
      return variant.attributes?.every(attr => {
        // Skip the current attribute we're checking
        if (attr.key === attributeKey) return true;
        // Check if the variant has the currently selected value for other attributes
        return selectedAttributes[attr.key] && 
               attr.value.split(",").map(v => v.trim()).includes(selectedAttributes[attr.key]);
      });
    });

    // Get unique values from filtered variants
    filteredVariants.forEach(variant => {
      const attr = variant.attributes?.find(attr => attr.key === attributeKey);
      if (attr) {
        attr.value.split(",").forEach(value => values.add(value.trim()));
      }
    });

    return Array.from(values);
  };

  // Get variants that match all currently selected attributes
  const getMatchingVariants = (attributeKey, attributeValue) => {
    if (!product?.variants) return [];
    return product.variants.filter(variant => {
      return variant.attributes?.every(attr => {
        if (attr.key === attributeKey) {
          return attr.value.split(",").map(v => v.trim()).includes(attributeValue);
        }
        return selectedAttributes[attr.key] && 
               attr.value.split(",").map(v => v.trim()).includes(selectedAttributes[attr.key]);
      });
    });
  };

  const handleAttributeChange = (attributeKey, attributeValue) => {
    // Create a new attributes object with the updated value
    const newAttributes = { ...selectedAttributes, [attributeKey]: attributeValue };

    // Find all variants that match the new selection
    const matchingVariants = product.variants.filter(variant => {
      return variant.attributes?.every(attr => {
        const selectedValue = newAttributes[attr.key];
        return selectedValue && attr.value.split(",").map(v => v.trim()).includes(selectedValue);
      });
    });

    // Update attributes to only include values that are available in matching variants
    const updatedAttributes = { ...newAttributes };
    getAttributeKeys().forEach(key => {
      if (key !== attributeKey) {
        const availableValues = new Set();
        matchingVariants.forEach(variant => {
          const attr = variant.attributes?.find(attr => attr.key === key);
          if (attr) {
            attr.value.split(",").forEach(value => availableValues.add(value.trim()));
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
    product.variants.forEach(variant => {
      variant.attributes?.forEach(attr => keys.add(attr.key));
    });
    return Array.from(keys);
  };

  // Check if an attribute value is available with current selections
  const isAttributeValueAvailable = (attributeKey, attributeValue) => {
    return getAvailableAttributeValues(attributeKey).includes(attributeValue);
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

  const allImages = selectedVariant?.images || [product.mainImage, ...(product.images || [])];

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
      return selectedVariant.title?.en || selectedVariant.title?.ar;
    }
    return product.title?.en || product.title?.ar || product.name?.en || product.name?.ar;
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
              justifyContent: "space-between"
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
                  cursor: "zoom-in"
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
                        WebkitTapHighlightColor: "rgba(0,0,0,0)",
                        WebkitTapHighlightColor: "transparent",
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
          <div className="h-100 d-flex flex-column justify-content-start" style={{ minWidth: 0 }}>
            <h2 style={{
              margin: "0 0 15px",
              color: "#4b5966",
              fontSize: 28,
              fontWeight: 600,
              lineHeight: 1.3,
              wordBreak: "break-word"
            }}>{getCurrentTitle()}</h2>
            
            <div className="mb-2">
              {[1,2,3,4,5].map(i => (
                <FaStar
                  key={i}
                  color={i <= Math.round(product.ratingSummary?.average || 0) ? "#f8bf87" : "#ccc"}
                  style={{ marginRight: 2 }}
                />
              ))}
            </div>

            <div style={{ margin: "15px 0", fontSize: 22, fontWeight: 700 }}>
              {getCurrentPrice() && getCurrentPrice() > 0 ? (
                <>
                  <span style={{ color: "#5caf90" }}>${getCurrentPrice()}</span>
                  {getOriginalPrice() > getCurrentPrice() && (
                    <span style={{
                      color: "#999",
                      textDecoration: "line-through",
                      fontSize: 18,
                      marginLeft: 10
                    }}>${getOriginalPrice()}</span>
                  )}
                </>
              ) : (
                <span>Price not available</span>
              )}
            </div>

            <div style={{ margin: "10px 0", color: getCurrentQuantity() > 0 ? "#5caf90" : "#d9534f", fontWeight: 500 }}>
              {getCurrentQuantity() > 0 ? `In Stock (${getCurrentQuantity()})` : "Out of Stock"}
            </div>

            {/* Product Description - Shared between simple and variant */}
            <div className="mb-4">
              <h5 className="mb-3">Description</h5>
              <div style={{ color: "#666", lineHeight: 1.6, maxWidth: "100%", overflow: "hidden", overflowWrap: "break-word", wordBreak: "break-word" }}>
                <div dangerouslySetInnerHTML={{__html: product.description?.en || product.description?.ar || "No description available"}} />
              </div>
            </div>

            {product.productType === "variant" ? (
              // Variant Product Selection
              getAttributeKeys().map(attributeKey => (
                <div key={attributeKey} className="mb-4">
                  <h5 className="mb-3">Select {attributeKey.charAt(0).toUpperCase() + attributeKey.slice(1)}</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {getAvailableAttributeValues(attributeKey).map(value => {
                      const matchingVariants = getMatchingVariants(attributeKey, value);
                      const firstMatchingVariant = matchingVariants[0];
                      
                      return (
                        <div
                          key={value}
                          className="attribute-option"
                          style={{
                            position: "relative",
                            cursor: "pointer"
                          }}
                          onClick={() => handleAttributeChange(attributeKey, value)}
                        >
                          {attributeKey.toLowerCase() === "color" && firstMatchingVariant?.mainImage ? (
                            // Show image only for color attribute
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                border: selectedAttributes[attributeKey] === value ? "2px solid #5caf90" : "1px solid #ddd",
                                overflow: "hidden",
                                position: "relative"
                              }}
                            >
                              <img
                                src={firstMatchingVariant.mainImage}
                                alt={value}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover"
                                }}
                              />
                            </div>
                          ) : (
                            // Show button for all other attributes
                            <button
                              className={`btn ${selectedAttributes[attributeKey] === value ? 'btn-success' : 'btn-outline-success'}`}
                              disabled={!isAttributeValueAvailable(attributeKey, value)}
                            >
                              {value}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : null}

            {/* Add to Cart Button */}
            <button 
              className="btn btn-success btn-lg w-100"
              disabled={product.productType === "variant" && Object.keys(selectedAttributes).length === 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
