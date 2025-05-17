import { useSelector, useDispatch } from 'react-redux';
import { setCategory, setSubcategory } from '../../Store/Slices/filtersSlice';
import { fetchProductsByCategory } from '../../Store/Slices/productsSlice';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';


const MegaMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories, subcategories, loading } = useSelector((state) => state.categories);

  const handleCategoryClick = (categoryId, categorySlug) => {
    dispatch(setCategory(categoryId));
    dispatch(fetchProductsByCategory(categoryId));
    navigate(`/products/${categorySlug}`);
  };

  const handleSubcategoryClick = (categoryId, categorySlug, subcategoryId, subcategorySlug) => {
    dispatch(setCategory(categoryId));
    dispatch(setSubcategory(subcategoryId));
    dispatch(fetchProductsByCategory(categoryId));
    navigate(`/products/${categorySlug}/${subcategorySlug}`);
  };

  const getCategoryName = (category) => {
    if (category && category.name) {
      return typeof category.name === 'object'
        ? category.name.en || category.name.ar
        : category.name;
    }
    return 'Unknown Category';
  };

  const getSubcategoryName = (subcategory) => {
    if (subcategory && subcategory.name) {
      return typeof subcategory.name === 'object'
        ? subcategory.name.en || subcategory.name.ar
        : subcategory.name;
    }
    return 'Unknown Subcategory';
  };

  const organizeCategories = () => {
    const columns = [[], [], [], [], []];
    categories.forEach((category, index) => {
      columns[index % 5].push(category);
    });
    return columns;
  };

  const categoryColumns = organizeCategories();

  if (loading || categories.length === 0) {
    return <div> Loading...</div>;
  }

  return (
    <div className="mega-menu dropdown-menu position-absolute">
      <Container>
        <Row className="py-4">
          {categoryColumns.map((column, columnIndex) => (
            <Col md={2} key={columnIndex}>
              {column.map((category) => (
                <div key={category.id} className="mb-4">
                  <h5
                    className="text-success mb-3 category-title"
                    onClick={() => handleCategoryClick(category.id, category.slug)}
                  >
                    {getCategoryName(category)}
                  </h5>
                  <Nav className="flex-column">
                    {subcategories[category.id]?.map((subcategory) => (
                      <Nav.Link
                        href="#"
                        className="text-secondary"
                        key={subcategory.id}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubcategoryClick(
                            category.id,
                            category.slug,
                            subcategory.id,
                            subcategory.slug
                          );
                        }}
                      >
                        {getSubcategoryName(subcategory)}
                      </Nav.Link>
                    ))}
                  </Nav>
                </div>
              ))}
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default MegaMenu;