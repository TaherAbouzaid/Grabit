import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where, getDocs as getSubDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import ProductCard from "./ProductCard";
import { Container, Row, Col, Spinner, Nav } from "react-bootstrap";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All" },
    { id: "Home & Kitchen", name: "Home & Kitchen" },
    { id: "Food", name: "Food" },
    { id: "Health & Beauty", name: "Health & Beauty" }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsRef = collection(db, "allproducts");
        let q;

        if (activeCategory === "all") {
          q = query(productsRef, orderBy("createdAt", "desc"), limit(10));
        } else {
          q = query(
            productsRef,
            where("categoryId.name.en", "==", activeCategory),
            orderBy("createdAt", "desc"),
            limit(10)
          );
        }

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
        
        console.log("Active Category:", activeCategory);
        console.log("All products:", products);
        
        setProducts(products);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="mb-2" style={{ fontWeight: 700 }}>
            New <span style={{ color: '#5caf90' }}>Arrivals</span>
          </h2>
          <p className="mb-0" style={{ color: '#888' }}>
            Shop online for new arrivals and get free shipping!
          </p>
        </Col>
        <Col xs="auto">
          <Nav className="category-tabs">
            {categories.map((category) => (
              <Nav.Item key={category.id}>
                <Nav.Link
                  active={activeCategory === category.id}
                  onClick={() => {
                    console.log("Category clicked:", category.id);
                    setActiveCategory(category.id);
                  }}
                  className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                >
                  {category.name}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Col>
      </Row>
      <div style={{ minHeight: "800px", position: "relative" }}>
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
          <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-3">
            {products.map((product) => (
              <Col key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Container>
  );
};

export default NewArrivals;