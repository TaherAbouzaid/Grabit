import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import ProductCardSmall from "./ProductCardSmall";
import { collection, getDocs, getDocs as getSubDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Spinner } from "react-bootstrap";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useLanguage } from "../context/LanguageContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./styles.css";

const TopRatedItems = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef();
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    const fetchTopRatedProducts = async () => {
      try {
        setIsLoading(true);
        const productsRef = collection(db, "allproducts");
        const snapshot = await getDocs(productsRef);
        const products = [];

        // Fetch each product and its variants if it's a variant product
        for (const doc of snapshot.docs) {
          const productData = { id: doc.id, ...doc.data() };
          
          // If it's a variant product, fetch its variants
          if (productData.productType === "variant") {
            const variantsSnapshot = await getSubDocs(collection(db, `allproducts/${doc.id}/variants`));
            const variants = [];
            variantsSnapshot.forEach((variantDoc) => {
              variants.push({ id: variantDoc.id, ...variantDoc.data() });
            });
            productData.variants = variants;
          }
          
          products.push(productData);
        }

        // Sort products by rating
        const sortedProducts = products
          .filter(product => product.ratingSummary?.average > 0)
          .sort((a, b) => b.ratingSummary.average - a.ratingSummary.average)
          .slice(0, 6);

        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching top rated products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopRatedProducts();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    rows: 3,
    slidesPerRow: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          rows: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          rows: 1,
        },
      },
    ],
  };

  return (
    <div className="slider-section-fixed-width">
      <div className="slider-header-row d-flex align-items-center justify-content-between mb-3">
        <h3 className="slider-header-title mb-0">
          {currentLanguage === "ar" ? "الأعلى" : "Top"}{" "}
          <span style={{ color: "#5caf90", fontSize: "1.5rem" }}>
            {currentLanguage === "ar" ? "تقييماً" : "Rated"}
          </span>
        </h3>
        <div className="slider-header-arrows">
          <button
            className="trending-arrow me-1"
            onClick={() => sliderRef.current?.slickPrev()}
            aria-label="Previous"
            style={
              currentLanguage === "ar" ? { transform: "rotate(180deg)" } : {}
            }
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            className="trending-arrow"
            onClick={() => sliderRef.current?.slickNext()}
            aria-label="Next"
            style={
              currentLanguage === "ar" ? { transform: "rotate(180deg)" } : {}
            }
          >
            <FiChevronRight size={24} />
          </button>
        </div>
      </div>
      {isLoading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: 300 }}
        >
          <Spinner
            animation="border"
            variant="success"
            style={{ width: "3rem", height: "3rem" }}
          />
        </div>
      ) : (
        <div className="slider-wrapper-centered">
          <Slider ref={sliderRef} {...settings}>
            {products.map((product) => (
              <div key={product.id} className="mb-3">
                <ProductCardSmall product={product} />
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default TopRatedItems; 