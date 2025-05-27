import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import ProductCard from './ProductCard';
// import { useTranslation } from 'react-i18next';
import Slider from "react-slick";
import { Container, Spinner } from "react-bootstrap";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const RelatedProducts = ({ product, currentProductId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // const {   i18n } = useTranslation();
  // const currentLanguage = i18n.language;

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product || !product.categoryId?.categoryId) return;
      
      try {
        setLoading(true);
        const productsRef = collection(db, "allproducts");
        const q = query(
          productsRef,
          where("categoryId.categoryId", "==", product.categoryId.categoryId),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const products = [];
        
        for (const doc of snapshot.docs) {
          // Skip the current product
          if (doc.id === currentProductId) continue;
          
          const productData = { id: doc.id, ...doc.data() };
          products.push(productData);
        }
        
        setRelatedProducts(products);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product, currentProductId]);

  const settings = {
    infinite: true,
    slidesToShow: 4,
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
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 992,
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


  // if (loading) {
  //   return (
  //     <div className="text-center my-4">
  //       <div className="spinner-border text-success" role="status">
  //         <span className="visually-hidden">Loading...</span>
  //       </div>
  //     </div>
  //   );
  // }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    // <div className="related-products mt-5">
    //   <h3 className="mb-4">
    //     {currentLanguage === "ar" ? "منتجات ذات صلة" : "Related Products"}
    //   </h3>
    //   <div className="row g-4">
    //     {relatedProducts.map((product) => (
    //       <div key={product.id} className="col-6 col-md-3">
    //         <ProductCard product={product} />
    //       </div>
    //     ))}
    //   </div>
    // </div>
    <Container >
      <div style={{ minHeight: "420px", position: "relative" }} >
        {loading ? (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Spinner
              animation="border"
              variant="success"
              style={{ width: "3rem", height: "3rem" }}
            />
          </div>
        ) : (
            
            <Slider {...settings}>
              {relatedProducts.map((product) => (
                <div key={product.id} className="p-2" data-aos="fade-up"
                data-aos-once="true"
                data-aos-anchor-placement="top-bottom"
                data-aos-delay="50"
                data-aos-duration="2000"
                data-aos-offset="300">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
        )}
      </div>
    </Container>
  );
};

export default RelatedProducts;