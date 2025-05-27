import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductCardHorizontal from "./ProductCardHorizontal";
import ProductToolbar from "./ProductToolbar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Container, Spinner, Pagination, Row, Col } from "react-bootstrap";
import SidebarFilter from "../componant/SidebarFilter/SidebarFilter";
import { useSelector, useDispatch } from "react-redux";
import {
  setCategory,
  setSubcategory,
  setPriceRange,
} from "../Store/Slices/filtersSlice";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import { useSearchParams } from "react-router-dom";

const PRODUCTS_PER_PAGE = 8;

const ProductSubCategory = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("latest");
  const [view, setView] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const filter = useSelector((state) => state.filter);
  useTranslation();
  const { currentLanguage } = useLanguage();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log("Fetching products...");
        const productsRef = collection(db, "allproducts");
        const snapshot = await getDocs(productsRef);
        console.log("Total products in database:", snapshot.docs.length);

        const products = [];

        for (const doc of snapshot.docs) {
          const productData = { id: doc.id, ...doc.data() };

          // تسجيل بيانات المنتج للتشخيص
          console.log("Product data:", {
            id: doc.id,
            categoryId: productData.categoryId?.categoryId,
            subCategoryId: productData.subCategoryId?.subcategoryId,
          });

          if (productData.productType === "variant") {
            const variantsSnapshot = await getDocs(
              collection(db, `allproducts/${doc.id}/variants`)
            );
            const variants = [];
            variantsSnapshot.forEach((variantDoc) => {
              variants.push({ id: variantDoc.id, ...variantDoc.data() });
            });
            productData.variants = variants;
          }

          products.push(productData);
        }

        console.log("Products processed:", products.length);
        setProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");

    if (categoryParam) {
      dispatch(setCategory(categoryParam));
    }

    if (subcategoryParam) {
      dispatch(setSubcategory(subcategoryParam));
    }
  }, [searchParams, dispatch]);

  // Log filter values for debugging
  useEffect(() => {}, [filter]);

  const filteredProducts = products
    .filter((product) => {
      // إذا لم يتم اختيار فئة، أظهر كل المنتجات
      if (!filter.category) return true;

      // إذا تم اختيار فئة فرعية، أظهر فقط المنتجات المرتبطة بها
      if (filter.subcategory) {
        return product.subCategoryId?.subcategoryId === filter.subcategory;
      }

      // إذا لم يتم اختيار فئة فرعية، أظهر المنتجات المرتبطة بالفئة أو بفئاتها الفرعية
      return (
        product.categoryId?.categoryId === filter.category ||
        product.subCategoryId?.parentCategoryId === filter.category
      );
    })
    .filter((product) => {
      // تحقق من نطاق السعر
      const productPrice =
        (product.productType === "variant" && product.variants?.[0]?.price) ||
        product.price ||
        0;
      if (
        productPrice < filter.priceRange[0] ||
        productPrice > filter.priceRange[1]
      ) {
        return false;
      }

      // تحقق من العلامات
      const productTags = product.tags || [];
      if (filter.tags.length > 0) {
        if (!filter.tags.some((tag) => productTags.includes(tag))) {
          return false;
        }
      }

      return true;
    });

  // إضافة تسجيل لعدد المنتجات قبل وبعد الفلترة
  useEffect(() => {
    console.log("Total products before filtering:", products.length);
    console.log("Filtered products:", filteredProducts.length);
    console.log("Current filter:", filter);

    // تحقق من المنتجات المفقودة
    if (filter.category) {
      const categoryProducts = products.filter(
        (p) => p.categoryId?.categoryId === filter.category
      );
      console.log("Products in selected category:", categoryProducts.length);

      if (
        categoryProducts.length > filteredProducts.length &&
        !filter.subcategory
      ) {
        console.log(
          "Missing products:",
          categoryProducts.length - filteredProducts.length
        );
        // عرض عينة من المنتجات المفقودة
        const missingProducts = categoryProducts.filter(
          (p) => !filteredProducts.includes(p)
        );
        if (missingProducts.length > 0) {
          console.log("Sample missing product:", missingProducts[0]);
        }
      }
    }
  }, [products, filteredProducts, filter]);

  // Log filtered products for debugging
  useEffect(() => {}, [filteredProducts]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter.category, filter.subcategory, filter.priceRange, filter.tags]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice =
      (a.productType === "variant" && a.variants?.[0]?.price) || a.price;
    const bPrice =
      (b.productType === "variant" && b.variants?.[0]?.price) || b.price;
    const aTitle =
      (a.productType === "variant" && a.variants?.[0]?.title?.en) ||
      a.title?.en ||
      "";
    const bTitle =
      (b.productType === "variant" && b.variants?.[0]?.title?.en) ||
      b.title?.en ||
      "";

    if (sort === "price-asc") return aPrice - bPrice;
    if (sort === "price-desc") return bPrice - aPrice;
    if (sort === "name-asc") return aTitle.localeCompare(bTitle);
    if (sort === "name-desc") return bTitle.localeCompare(aTitle);
    return (
      new Date(b.createdAt.seconds * 1000) -
      new Date(a.createdAt.seconds * 1000)
    );
  });

  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);

  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  useEffect(() => {
    if (filter.category === null) {
      // إعادة جلب كل المنتجات عند اختيار All
      const fetchAllProducts = async () => {
        try {
          setLoading(true);
          const productsRef = collection(db, "allproducts");
          const snapshot = await getDocs(productsRef);
          const allProducts = [];
          for (const doc of snapshot.docs) {
            const productData = { id: doc.id, ...doc.data() };
            if (productData.productType === "variant") {
              const variantsSnapshot = await getDocs(
                collection(db, `allproducts/${doc.id}/variants`)
              );
              const variants = [];
              variantsSnapshot.forEach((variantDoc) => {
                variants.push({ id: variantDoc.id, ...variantDoc.data() });
              });
              productData.variants = variants;
            }
            allProducts.push(productData);
          }
          setProducts(allProducts);
        } catch (error) {
          console.error("Error fetching all products:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAllProducts();
    }
  }, [filter.category]);

  // احسب أقل وأعلى سعر من المنتجات بعد الفلترة حسب الفئة/الفئة الفرعية فقط
  useEffect(() => {
    const filteredForPrice = products.filter((product) => {
      if (!filter.category) return true;
      if (filter.subcategory) {
        return product.subCategoryId?.subcategoryId === filter.subcategory;
      }
      return (
        product.categoryId?.categoryId === filter.category ||
        product.subCategoryId?.parentCategoryId === filter.category
      );
    });

    const prices = filteredForPrice.map(
      (p) =>
        (p.productType === "variant" && p.variants?.[0]?.discountPrice) ||
        p.discountPrice ||
        (p.productType === "variant" && p.variants?.[0]?.price) ||
        p.price ||
        0
    );
    const min = prices.length > 0 ? Math.min(...prices) : 0;
    const max = prices.length > 0 ? Math.max(...prices) : 1000;

    dispatch(setPriceRange([min, max]));
  }, [filter.category, filter.subcategory, products, dispatch]);

  return (
    <Container className="py-4">
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "300px" }}
        >
          <Spinner
            animation="border"
            variant="success"
            style={{ width: "3rem", height: "3rem" }}
          />
        </div>
      ) : (
        <Container fluid className="py-4">
          <Row>
            <Col lg={3} md={4} className="d-md-block">
              <SidebarFilter
                allProducts={products}
                minPrice={filter.priceRange[0]}
                maxPrice={filter.priceRange[1]}
              />
            </Col>
            <Col lg={9} md={8}>
              {filteredProducts.length === 0 ? (
                <div className="text-center mt-4">
                  <p className="text-muted">
                    {currentLanguage === "ar"
                      ? "لا توجد منتجات لهذه الفئة الفرعية."
                      : "No products found for this subcategory."}
                  </p>
                </div>
              ) : (
                <>
                  <ProductToolbar
                    onSortChange={setSort}
                    onViewChange={setView}
                    viewType={view}
                  />
                  <div className={view === "grid" ? "row" : "row"}>
                    {currentProducts.map((product) =>
                      view === "grid" ? (
                        <div
                          key={product.id}
                          className="col-lg-3 col-md-6 col-sm-6 mb-4"
                        >
                          <ProductCard product={product} />
                        </div>
                      ) : (
                        <div key={product.id} className="col-12 mb-3">
                          <ProductCardHorizontal product={product} />
                        </div>
                      )
                    )}
                  </div>
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <span className="text-muted" style={{ fontSize: 15 }}>
                        {currentLanguage === "ar"
                          ? `عرض ${indexOfFirstProduct + 1}-${Math.min(
                              indexOfLastProduct,
                              sortedProducts.length
                            )} من ${sortedProducts.length} منتج`
                          : `Showing ${indexOfFirstProduct + 1}-${Math.min(
                              indexOfLastProduct,
                              sortedProducts.length
                            )} of ${sortedProducts.length} item(s)`}
                      </span>
                      <Pagination className="custom-pagination">
                        <Pagination.Prev
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        {Array.from({ length: totalPages }).map((_, index) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            index === 0 ||
                            index === totalPages - 1 ||
                            (index >= currentPage - 2 && index <= currentPage)
                          ) {
                            return (
                              <Pagination.Item
                                key={index}
                                active={index + 1 === currentPage}
                                onClick={() => setCurrentPage(index + 1)}
                              >
                                {index + 1}
                              </Pagination.Item>
                            );
                          } else if (
                            index === 1 ||
                            index === totalPages - 2
                          ) {
                            return <Pagination.Ellipsis key={index} />;
                          }
                          return null;
                        })}
                        <Pagination.Next
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Col>
          </Row>
        </Container>
      )}
    </Container>
  );
};

export default ProductSubCategory;


