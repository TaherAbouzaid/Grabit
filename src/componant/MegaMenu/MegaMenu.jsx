
import React, { useMemo } from 'react';
import { Container, Row, Col, Nav, Spinner, Accordion } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { setCategory, setSubcategory } from '../../Store/Slices/filtersSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './MegaMenu.css';

const NewMega = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const products = useSelector((state) => state.products.items);
  const [isLoading, setIsLoading] = React.useState(true);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const filteredProducts = products.filter(p => {
      if (!p.categoryId || !p.categoryId.categoryId) {
        console.log('Product missing categoryId:', p);
        return false;
      }
      return true;
    });
    const categoriesMap = new Map(filteredProducts.map(p => [
      p.categoryId.categoryId,
      {
        id: p.categoryId.categoryId,
        name: p.categoryId.name?.[i18n.language] || t('categories.uncategorized', 'Uncategorized')
      }
    ]));
    return Array.from(categoriesMap.values());
  }, [products, t, i18n.language]);

  // Extract subcategories dynamically
  const subcategories = useMemo(() => {
    const subcategoriesMap = new Map();
    products.forEach((p) => {
      const sub = p.subCategoryId;
      if (sub?.subcategoryId && !subcategoriesMap.has(sub.subcategoryId)) {
        subcategoriesMap.set(sub.subcategoryId, {
          id: sub.subcategoryId,
          name: sub.name?.[i18n.language] || sub.subcategoryId,
          categoryId: p.categoryId?.categoryId
        });
      } else if (!sub?.subcategoryId) {
        console.log('Product missing subCategoryId:', p);
      }
    });
    return Array.from(subcategoriesMap.values()).reduce((acc, sub) => {
      if (sub.categoryId) {
        acc[sub.categoryId] = acc[sub.categoryId] || [];
        acc[sub.categoryId].push(sub);
      }
      return acc;
    }, {});
  }, [products, i18n.language]);

  // Handle subcategory click to update filters and navigate to shop
  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    dispatch(setCategory(categoryId));
    dispatch(setSubcategory(subcategoryId));
    navigate('/shop');
  };

  // Simulate loading for UX
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [products]);

  return (
    <div className="mega-menu">
      <Container>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100px' }}>
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <>
            {/* Column layout for md and larger screens */}
            <Row className="d-none d-md-flex">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Col xs={12} sm={6} md={4} lg={2} key={category.id} className="mega-menu-col">
                    <h5>{category.name}</h5>
                    {subcategories[category.id]?.length > 0 ? (
                      <ul className="list-unstyled">
                        {subcategories[category.id].map((subcategory) => (
                          <li key={subcategory.id} className="mb-2">
                            <Nav.Link
                              href={`#subcategory-${subcategory.id}`}
                              onClick={() => handleSubcategoryClick(category.id, subcategory.id)}
                              className="p-0"
                            >
                              {subcategory.name}
                            </Nav.Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted small">{t('categories.no_subcategories', 'No subcategories')}</p>
                    )}
                  </Col>
                ))
              ) : (
                <Col>
                  <p className="text-muted">{t('categories.no_categories', 'No categories available')}</p>
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
                                href={`#subcategory-${subcategory.id}`}
                                onClick={() => handleSubcategoryClick(category.id, subcategory.id)}
                                className="p-0"
                              >
                                {subcategory.name}
                              </Nav.Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted small">{t('categories.no_subcategories', 'No subcategories')}</p>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                ))
              ) : (
                <p className="text-muted">{t('categories.no_categories', 'No categories available')}</p>
              )}
            </Accordion>
          </>
        )}
      </Container>
    </div>
  );
};

export default NewMega;