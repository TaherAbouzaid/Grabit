import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Spinner, Card } from 'react-bootstrap';
import SidebarFilter from '../SidebarFilter/SidebarFilter';
import { Link, useNavigate } from "react-router-dom"; 
import './Products.css'
import { useAuth } from '../../context/AuthContext';
import { addToLocalWishlist, addToWishlist } from '../../Store/Slices/wishlistSlice';
import { addToCart, fetchCart } from '../../Store/Slices/cartSlice';
import { fetchProducts} from '../../Store/Slices/productsSlice'



const ProductPage = () => {
  const dispatch = useDispatch();
  // const { items:allProducts, loading, error } = useSelector((state) => state.products);
  const { category, subcategory, priceRange, tags, searchQuery} = useSelector((state) => state.filter);
  const { user } = useAuth();
  // const user = useSelector(state => state.user.user); 
  const { items: products, loading, error } = useSelector(state => state.products);
  // const { currentUser } = useSelector(state => state.user);
  const { error: cartError, loading: cartLoading } = useSelector(state => state.cart);


const navigate = useNavigate();


  
   useEffect(() => {
    dispatch(fetchProducts()); 
  }, []);

  useEffect(() => {
    if (user && user.uid) {
      console.log("Fetching cart on mount for userId:", user.uid);
      dispatch(fetchCart(user.uid));
    }
  }, [dispatch, user]);


 const handleAddToWishlist = (product) => {
  if (user && user.uid) {
    dispatch(addToWishlist({ product, userId: user.uid }));
  } else {
    dispatch(addToLocalWishlist(product));
  }
};

//  const handleAddToCart = (product) => {
//     if (!user) {
//       navigate("/login");
//     } else {
//       dispatch(addToCart({ product, userId: user.uid }));
//     }
//   };

 const handleAddToCart =async (productId, price) => {
    console.log("Current user:", user);
    if (!user || !user.uid) {
      console.log("No user logged in or userId is undefined");
      alert("Please log in to add items to your cart");
      navigate("/login");
      return;
    }
    console.log("Dispatching addToCart for productId:", productId, "userId:", user.uid);
    await dispatch(addToCart({ userId: user.uid, productId, price }));
    console.log("Fetching cart after addToCart for userId:", user.uid);
    await dispatch(fetchCart(user.uid));
  };


  const allProducts = products || [];
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
                       <button onClick={() => handleAddToWishlist(product)}>Add to Wishlist ❤️</button>  
                        <button onClick={()=>handleAddToCart(product.id, product.price)}
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                           disabled={cartLoading}
                           >Add to Cart</button>
                                     {cartError && <p className="text-red-500">{cartError}</p>}

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
