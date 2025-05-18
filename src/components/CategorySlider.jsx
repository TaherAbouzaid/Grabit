import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import CategoryCard from "./CategoryCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Container, Spinner } from "react-bootstrap";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const iconMap = {
  "Home & Kitchen": "home_kitchen",
  "Electronics": "electronics",
  "Clothing": "clothing",
  "Health & Beauty": "health_beauty",
  "Food": "food",
};

const CategorySlider = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      setIsLoading(true);
      setShowSlider(false);
      try {
     
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log('Categories from collection:', categoriesData.map(cat => cat.name.en.trim().toLowerCase()));

     
        const productsSnapshot = await getDocs(collection(db, "allproducts"));
        const products = productsSnapshot.docs.map(doc => doc.data());
    
        const filteredProducts = products.filter(p => {
          if (!p.categoryId) {
            console.log('Product missing categoryId:', p);
            return false;
          }
          return true;
        });
    
        console.log('Categories from products (filtered):', filteredProducts.map(p => p.categoryId));

     
        const categoryCounts = {};
        filteredProducts.forEach(product => {
          let catId = null;
          if (typeof product.categoryId === 'string') {
            catId = product.categoryId.trim();
          } else if (product.categoryId && typeof product.categoryId === 'object') {
            if (typeof product.categoryId.categoryId === 'string') {
              catId = product.categoryId.categoryId.trim();
            } else if (product.categoryId.id) {
              catId = product.categoryId.id.toString().trim();
            }
          }
          console.log('Resolved catId:', catId, 'from', product.categoryId);
          if (!catId) return;
          categoriesData.forEach(cat => {
            const categoryId = cat.id.toString().trim();
      
            console.log('Comparing product.categoryId:', catId, 'with category.id:', categoryId);
            if (catId === categoryId) {
              if (!categoryCounts[catId]) categoryCounts[catId] = 0;
              categoryCounts[catId]++;
            }
          });
        });

        
        const cats = categoriesData.map(cat => ({
          key: iconMap[cat.name.en] || "other",
          title: cat.name.en,
          count: categoryCounts[cat.id] || 0,
          discount: Math.floor(Math.random() * 30) + 10,
        }));
        console.log('Final categories with counts:', cats);
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching categories or products:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => setShowSlider(true), 400);
      }
    };
    fetchCategoriesAndProducts();
  }, []);

  const settings = {
    // dots: true,
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

  return (
    <Container>
      <div className={showSlider ? "fadeup-feature" : ""} style={{ minHeight: "220px", position: "relative" }}>
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
            {categories.map((cat, idx) => (
              <div key={cat.key + idx} className="p-2">
                <CategoryCard category={cat.key} title={cat.title} count={cat.count} discount={cat.discount} />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </Container>
  );
};

export default CategorySlider; 