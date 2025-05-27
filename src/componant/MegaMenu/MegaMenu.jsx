import React, { useMemo, useEffect } from "react";
import { Container, Row, Col, Nav, Spinner, Accordion } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setCategory, setSubcategory } from "../../Store/Slices/filtersSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./MegaMenu.css";

const NewMega = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const products = useSelector((state) => state.products.items);
  const [isLoading, setIsLoading] = React.useState(true);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const filteredProducts = products.filter((p) => {
      if (!p.categoryId || !p.categoryId.categoryId) {
        
        return false;
      }
      return true;
    });
    const categoriesMap = new Map(
      filteredProducts.map((p) => {
        let name = "";
        // إذا كان name كائن متعدد اللغات
        if (
          typeof p.categoryId.name === "object" &&
          p.categoryId.name !== null
        ) {
          name =
            p.categoryId.name[i18n.language] ||
            Object.values(p.categoryId.name)[0];
        }
        // إذا كان name نص فقط
        else if (typeof p.categoryId.name === "string") {
          name = p.categoryId.name;
        }
        // fallback
        else {
          name = t("categories.uncategorized", "Uncategorized");
        }
        return [
          p.categoryId.categoryId,
          {
            id: p.categoryId.categoryId,
            name,
          },
        ];
      })
    );
    return Array.from(categoriesMap.values());
  }, [products, t, i18n.language]);

  // Extract subcategories dynamically
  const subcategories = useMemo(() => {
    const subcategoriesMap = new Map();
    products.forEach((p) => {
      const sub = p.subCategoryId;
      if (sub?.subcategoryId && !subcategoriesMap.has(sub.subcategoryId)) {
        let subName = "";
        if (typeof sub.name === "object" && sub.name !== null) {
          subName = sub.name[i18n.language] || Object.values(sub.name)[0];
        } else if (typeof sub.name === "string") {
          subName = sub.name;
        } else {
          subName = t("categories.uncategorized", "Uncategorized");
        }
        subcategoriesMap.set(sub.subcategoryId, {
          id: sub.subcategoryId,
          name: subName,
          categoryId: p.categoryId?.categoryId,
        });
      } 
    });
    return Array.from(subcategoriesMap.values()).reduce((acc, sub) => {
      if (sub.categoryId) {
        acc[sub.categoryId] = acc[sub.categoryId] || [];
        acc[sub.categoryId].push(sub);
      }
      return acc;
    }, {});
  }, [products, i18n.language, t]);

  // Handle subcategory click to update filters and navigate to shop
  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    dispatch(setCategory(categoryId));
    dispatch(setSubcategory(subcategoryId));
    navigate(`/shop?category=${categoryId}&subcategory=${subcategoryId}`);
  };

  // Simulate loading for UX
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [products]);

  useEffect(() => {
    // Function to prevent horizontal scroll when mega menu is open
    const handleMenuOpen = () => {
      document.body.classList.add('mega-menu-open');
    };
    
    const handleMenuClose = () => {
      document.body.classList.remove('mega-menu-open');
    };
    
    const megaMenuWrapper = document.querySelector('.header-mega-wrapper');
    const navDropdown = document.querySelector('.header-nav-dropdown');
    
    if (navDropdown) {
      navDropdown.addEventListener('mouseenter', handleMenuOpen);
      navDropdown.addEventListener('mouseleave', handleMenuClose);
    }
    
    if (megaMenuWrapper) {
      megaMenuWrapper.addEventListener('mouseenter', handleMenuOpen);
      megaMenuWrapper.addEventListener('mouseleave', handleMenuClose);
    }
    
    return () => {
      if (navDropdown) {
        navDropdown.removeEventListener('mouseenter', handleMenuOpen);
        navDropdown.removeEventListener('mouseleave', handleMenuClose);
      }
      
      if (megaMenuWrapper) {
        megaMenuWrapper.removeEventListener('mouseenter', handleMenuOpen);
        megaMenuWrapper.removeEventListener('mouseleave', handleMenuClose);
      }
      
      document.body.classList.remove('mega-menu-open');
    };
  }, []);

  return (
    <div className="mega-menu">
      <Container>
        {isLoading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "100px" }}
          >
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <>
            {/* Column layout for md and larger screens */}
            <Row className="d-none d-md-flex">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Col
                    xs={12}
                    sm={6}
                    md={4}
                    lg={2}
                    key={category.id}
                    className="mega-menu-col"
                  >
                    <h5>{category.name}</h5>
                    {subcategories[category.id]?.length > 0 ? (
                      <ul className="list-unstyled">
                        {subcategories[category.id].map((subcategory) => (
                          <li key={subcategory.id} className="mb-2">
                            <Nav.Link
                              onClick={() => handleSubcategoryClick(category.id, subcategory.id)}
                              className="p-0"
                            >
                              {subcategory.name}
                            </Nav.Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted small">
                        {t("categories.no_subcategories", "No subcategories")}
                      </p>
                    )}
                  </Col>
                ))
              ) : (
                <Col>
                  <p className="text-muted">
                    {t("categories.no_categories", "No categories available")}
                  </p>
                </Col>
              )}
            </Row>

            {/* Accordion layout for xs and sm screens */}
            <Accordion flush className="d-md-none">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Accordion.Item eventKey={category.id} key={category.id}>
                    <Accordion.Header>{category.name}</Accordion.Header>
                    <Accordion.Body>
                      {subcategories[category.id]?.length > 0 ? (
                        <ul className="list-unstyled">
                          {subcategories[category.id].map((subcategory) => (
                            <li key={subcategory.id} className="mb-2">
                              <Nav.Link
                                onClick={() => handleSubcategoryClick(category.id, subcategory.id)}
                                className="p-0"
                              >
                                {subcategory.name}
                              </Nav.Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted small">
                          {t("categories.no_subcategories", "No subcategories")}
                        </p>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                ))
              ) : (
                <p className="text-muted">
                  {t("categories.no_categories", "No categories available")}
                </p>
              )}
            </Accordion>
          </>
        )}
      </Container>
    </div>
  );
};

// eslint-disable-next-line no-irregular-whitespace
export default NewMega;
