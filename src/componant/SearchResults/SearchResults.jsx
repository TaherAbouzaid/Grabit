import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../../Store/Slices/productsSlice";
import ProductCard from "../../components/ProductCard";
import { useTranslation } from "react-i18next";
import "./SearchResults.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

const SearchResults = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const filters = useSelector((state) => state.filter);
  const searchQuery = filters?.searchQuery || "";
  
  const { items: productsData, loading } = useSelector((state) => state.products);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productsWithVariants, setProductsWithVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  useEffect(() => {
    if (productsData.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, productsData.length]);

  // تحميل الفاريانت للمنتجات
  useEffect(() => {
    const loadVariantsForProducts = async () => {
      if (productsData.length === 0) return;
      
      setLoadingVariants(true);
      
      try {
        const productsWithVariantsData = await Promise.all(
          productsData.map(async (product) => {
            // إذا كان المنتج من نوع فاريانت، قم بتحميل الفاريانت
            if (product.productType === "variant") {
              try {
                const variantsSnapshot = await getDocs(
                  collection(db, `allproducts/${product.id}/variants`)
                );
                
                const variants = [];
                variantsSnapshot.forEach((variantDoc) => {
                  variants.push({ id: variantDoc.id, ...variantDoc.data() });
                });
                
                return { ...product, variants };
              } catch (error) {
                console.error(`Error loading variants for product ${product.id}:`, error);
                return product;
              }
            }
            
            return product;
          })
        );
        
        setProductsWithVariants(productsWithVariantsData);
      } catch (error) {
        console.error("Error loading variants:", error);
      } finally {
        setLoadingVariants(false);
      }
    };
    
    loadVariantsForProducts();
  }, [productsData]);

  // تصفية المنتجات بناءً على استعلام البحث
  useEffect(() => {
    if (productsWithVariants.length > 0 && searchQuery) {
      const filtered = productsWithVariants.filter((product) => {
        // جمع جميع النصوص القابلة للبحث من المنتج
        const searchableTexts = [];
        
        // إضافة العناوين
        if (product.title) {
          if (typeof product.title === 'object') {
            Object.values(product.title).forEach(title => {
              if (title) searchableTexts.push(title.toLowerCase());
            });
          } else if (typeof product.title === 'string') {
            searchableTexts.push(product.title.toLowerCase());
          }
        }
        
        // إضافة الأسماء
        if (product.name) {
          if (typeof product.name === 'object') {
            Object.values(product.name).forEach(name => {
              if (name) searchableTexts.push(name.toLowerCase());
            });
          } else if (typeof product.name === 'string') {
            searchableTexts.push(product.name.toLowerCase());
          }
        }
        
        // إضافة الوصف
        if (product.description) {
          if (typeof product.description === 'object') {
            Object.values(product.description).forEach(desc => {
              if (desc) searchableTexts.push(desc.toLowerCase());
            });
          } else if (typeof product.description === 'string') {
            searchableTexts.push(product.description.toLowerCase());
          }
        }
        
        // البحث في جميع النصوص
        const query = searchQuery.toLowerCase();
        return searchableTexts.some(text => text.includes(query));
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, productsWithVariants]);

  // تحضير المنتجات للعرض مع معالجة المنتجات ذات الفاريانت
  const prepareProductsForDisplay = (products) => {
    return products.map(product => {
      // نسخة جديدة من المنتج
      const processedProduct = { ...product };
      
      // إذا كان المنتج من نوع فاريانت وله فاريانت واحد على الأقل
      if (product.productType === "variant" && Array.isArray(product.variants) && product.variants.length > 0) {
        // اختيار أول فاريانت
        const firstVariant = product.variants[0];
        
        // إضافة معلومات الفاريانت المحدد
        processedProduct.selectedVariantIndex = 0;
        processedProduct.selectedVariant = firstVariant;
        
        // إذا كان الفاريانت يحتوي على صورة رئيسية، استخدمها
        if (firstVariant.mainImage) {
          processedProduct.mainImage = firstVariant.mainImage;
        }
        
        // إذا كان الفاريانت يحتوي على صور، استخدمها
        if (firstVariant.images && firstVariant.images.length > 0) {
          processedProduct.images = firstVariant.images;
        }
        
        // إذا كان الفاريانت يحتوي على سعر، استخدمه
        if (firstVariant.price !== undefined) {
          processedProduct.price = firstVariant.price;
        }
        
        // إذا كان الفاريانت يحتوي على سعر مخفض، استخدمه
        if (firstVariant.discountPrice !== undefined) {
          processedProduct.discountPrice = firstVariant.discountPrice;
        }
        
        // إذا كان الفاريانت يحتوي على كمية، استخدمها
        if (firstVariant.quantity !== undefined) {
          processedProduct.quantity = firstVariant.quantity;
        }
      }
      
      return processedProduct;
    });
  };

  if (loading || loadingVariants) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // تحضير المنتجات للعرض قبل تمريرها إلى المكونات
  const displayProducts = prepareProductsForDisplay(filteredProducts);
  
  // طباعة المنتجات للتصحيح
  console.log("Display Products:", displayProducts);

  return (
    <Container className="search-results-container my-4">
      <h2 className="search-results-title mb-4">
        {searchQuery ? `${t("common.searchResults", { query: searchQuery })}` : t("common.search")}
      </h2>
      
      {displayProducts.length === 0 ? (
        <div className="no-results">
          <p>{searchQuery ? t("common.noResults") : t("common.enterQuery")}</p>
        </div>
      ) : (
        <Row>
          {displayProducts.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SearchResults;
