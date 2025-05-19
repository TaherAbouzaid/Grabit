import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchCategoriesWithSub } from '../../Store/Slices/categorySlicees';
import './MegaMenuProduct.css';

const MegaMenuProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategoriesWithSub());
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/shop`);
  };

  const handleSubCategoryClick = (categoryId, subCategoryId) => {
    navigate(`/shop`);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mega-menu-container py-5">
      <Row>
        {categories.map((category) => (
          <Col key={category.id} md={4} className="mb-4">
            <div className="category-card">
              <h3 
                className="category-title"
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name.en}
              </h3>
              {category.subcategories && category.subcategories.length > 0 && (
                <ul className="subcategory-list">
                  {category.subcategories.map((subCategory) => (
                    <li 
                      key={subCategory.id}
                      onClick={() => handleSubCategoryClick(category.id, subCategory.id)}
                    >
                      {subCategory.name.en}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MegaMenuProduct;