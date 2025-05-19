import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import ProductCard from "./ProductCard";
import { collection, getDocs, query, where, orderBy, limit, getDocs as getSubDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Container, Spinner } from "react-bootstrap";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const DiscountedProductsSlider = () => {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setIsLoading(true);
        const productsRef = collection(db, "allproducts");

        const q = query(
          productsRef,
          where("discountPrice", "!=", null),
          orderBy("createdAt", "desc"),
          limit(10)
        );

        const snapshot = await getDocs(q);
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

        setDiscountedProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, []);

  const settings = {
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 3000,
    cssEase: "linear",
    centerMode: true,
    centerPadding: "0px",
    arrows: false,
    dots: false,
    responsive: [
      {
        breakpoint: 1200, 
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992, 
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 580,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <Container>
      <div style={{ minHeight: "420px", position: "relative" }}>
        {isLoading ? (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}>
            <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
          </div>
        ) : (
          <Slider {...settings}>
            {discountedProducts.map((product) => (
              <div key={product.id} className="p-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </Container>
  );
};

export default DiscountedProductsSlider;
