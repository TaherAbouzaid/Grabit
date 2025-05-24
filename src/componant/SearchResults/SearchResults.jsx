import { useState, useEffect } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import ProductCard from "../../components/ProductCard"; // Adjust path
import { useSelector } from "react-redux";
import { db } from "../../firebase/config"; // Adjust path
import { collection, getDocs } from "firebase/firestore";
import { useTranslation } from "react-i18next"; // Add this import
import { useLanguage } from "../../context/LanguageContext";
import "./SearchResults.css";

const SearchResults = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const searchQuery = useSelector((state) => state.filter.searchQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, "allproducts"); // Changed to allproducts
        const productsSnap = await getDocs(productsRef);
        const productsData = productsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (!productsData.length) {
          console.warn("No products found in Firestore allproducts collection");
          setError(
            t("common.searchError", { message: "No products available." })
          );
          setProducts([]);
          return;
        }

        const filteredProducts = productsData.filter((product) => {
          // Collect all possible titles
          const titles = [];
          if (product.title) {
            if (product.title[currentLanguage])
              titles.push(product.title[currentLanguage]);
            if (product.title.en) titles.push(product.title.en);
            if (product.title.ar) titles.push(product.title.ar);
          }
          if (product.name) {
            if (product.name[currentLanguage])
              titles.push(product.name[currentLanguage]);
            if (product.name.en) titles.push(product.name.en);
            if (product.name.ar) titles.push(product.name.ar);
          }

          if (!titles.length) {
            console.warn(`Product ${product.id} has no valid titles`);
            return false;
          }

          return titles.some((title) =>
            title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        });

        setProducts(filteredProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          t("common.searchError", {
            message: err.message || "Failed to fetch products.",
          })
        );
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery?.trim()) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [searchQuery, currentLanguage, t]);

  if (loading) {
    return (
      <Container className="search-results py-4">
        <div className="text-center">{t("common.loadingResults")}</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="search-results py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!searchQuery?.trim()) {
    return (
      <Container className="search-results py-4">
        <Alert variant="info">{t("common.enterQuery")}</Alert>
      </Container>
    );
  }

  return (
    <Container className="search-results py-4">
      <h2 className="mb-4">
        {t("common.searchResults", { query: searchQuery })}
      </h2>
      {products.length === 0 ? (
        <Alert variant="info">{t("common.noResults")}</Alert>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {products.map((product) => (
            <Col key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SearchResults;
