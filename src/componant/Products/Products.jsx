import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Spinner, Card } from 'react-bootstrap';
import { fetchProducts } from '../../Store/Slices/productsSlice'; // استيراد الـ thunk
import SidebarFilter from '../SidebarFilter/SidebarFilter';
import { Link } from "react-router-dom"; 
import './Products.css'


const ProductPage = () => {
  const dispatch = useDispatch();
  const { items:allProducts, loading, error } = useSelector((state) => state.products);
  const { category, subcategory, priceRange, tags, searchQuery} = useSelector((state) => state.filter);

  

  useEffect(() => {
    dispatch(fetchProducts()); 
  }, [dispatch]);

  const filteredProducts = allProducts.filter((product) => {
      const matchesSearch = !searchQuery || product.title?.en.toLowerCase().includes(searchQuery.toLowerCase());

    return (
       matchesSearch &&
      (!category || product.categoryId?.categoryId === category) &&
      (!subcategory || product.subCategoryId?.subcategoryId === subcategory) &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1] &&
      (tags.length === 0 || tags.every((tag) => product.tags.includes(tag)))
    );
  });

const categories = [
  ...new Map(
    allProducts.map((p) => [
      p.categoryId.categoryId,
      {
        id: p.categoryId.categoryId,
        name: p.categoryId.name?.en || 'Unknown',
      },
    ])
  ).values(),
];

console.log("Search Query from Redux:", searchQuery);





  return (
    
    <div className="product-page">
        <div className="categories">
        <h3>Categories</h3>
     
         {categories.map((category) => (
      <Link
        key={category.id}
        to={`/category/${category.id}`} // Navigate to the selected category
        className="category-button"
      >
        {category.name}
      </Link>
    ))}


      </div>
      <Row>
        <Col md={3}>
          <SidebarFilter />
        </Col>
        <Col md={9}>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <div className="text-center">
              <p>Error: {error}</p>
            </div>
          ) : (
            <Row>
              {filteredProducts.map((product) => (
                <Col key={product.id} md={4}>
                  <Card>
                    <Card.Img variant="top" src={product.mainImage} />
                    <Card.Body>
                      <Card.Title>{product.title.en}</Card.Title>
                      <Card.Text>${product.price}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {filteredProducts.length === 0 && <p>No products found</p>}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProductPage;
