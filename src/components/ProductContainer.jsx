import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductCardHorizontal from "./ProductCardHorizontal";
import ProductToolbar from "./ProductToolbar";
import { collection, getDocs, getDocs as getSubDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Container, Spinner, Pagination } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import "./styles.css";

const PRODUCTS_PER_PAGE = 12;

const ProductContainer = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("latest");
  const [view, setView] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
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

        setProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    // Get the first variant or use main product data for comparison
    const aPrice = a.productType === "variant" && a.variants?.[0]?.price || a.price;
    const bPrice = b.productType === "variant" && b.variants?.[0]?.price || b.price;
    const aTitle = a.productType === "variant" && a.variants?.[0]?.title?.en || a.title?.en || "";
    const bTitle = b.productType === "variant" && b.variants?.[0]?.title?.en || b.title?.en || "";

    if (sort === "price-asc") return aPrice - bPrice;
    if (sort === "price-desc") return bPrice - aPrice;
    if (sort === "name-asc") return aTitle.localeCompare(bTitle);
    if (sort === "name-desc") return bTitle.localeCompare(aTitle);
    return new Date(b.createdAt.seconds * 1000) - new Date(a.createdAt.seconds * 1000);
  });

  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

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

  return (
    <Container className="py-4">
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
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
                <div className="col-md-4 mb-4" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ) : (
                <div className="col-md-6 mb-4" key={product.id}>
                  <ProductCardHorizontal product={product} />
                </div>
              )
            )}
          </div>
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted" style={{ fontSize: 15 }}>
                {`Showing ${indexOfFirstProduct + 1}-${Math.min(indexOfLastProduct, sortedProducts.length)} of ${sortedProducts.length} item(s)`}
              </span>
              <Pagination className="custom-pagination">
                <Pagination.Prev
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </Pagination.Prev>
                {paginationItems}
                <Pagination.Next
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Pagination.Next>
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductContainer;