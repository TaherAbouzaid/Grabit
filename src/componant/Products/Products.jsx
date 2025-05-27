import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Spinner, Card } from 'react-bootstrap';
import SidebarFilter from '../SidebarFilter/SidebarFilter';
import { Link, useNavigate } from "react-router-dom"; 
import './Products.css'
import { useAuth } from '../../context/AuthContext';
import { addToLocalWishlist, addToWishlist } from '../../store/Slices/wishlistSlice';
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


 useNavigate();


  
   useEffect(() => {
    dispatch(fetchProducts()); 
  }, [dispatch]);

  useEffect(() => {
    if (user && user.uid) {
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

 const handleAddToCart = async (productId, price) => {
  if (!user || !user.uid) {
    await dispatch(addToCart({ productId, price }));
    // eslint-disable-next-line no-undef
    await dispatch(fetchLocalCart());
    return;
  }
  await dispatch(addToCart({ userId: user.uid, productId, price }));
  await dispatch(fetchCart(user.uid));
};


  const allProducts = products || [];
  // تحسين منطق الفلترة للتأكد من أنه يعمل بشكل صحيح
  const filteredProducts = allProducts.filter((product) => {
    // تحقق من وجود البيانات المطلوبة
    if (!product) return false;
    
    // فلتر الفئة - تأكد من أن المنتج ينتمي للفئة المحددة
    const matchesCategory = !category || 
      (product.categoryId && product.categoryId.categoryId === category);
    
    // إذا تم تحديد فئة ولكن المنتج لا ينتمي إليها، قم بإرجاع false مباشرة
    if (category && !matchesCategory) return false;
    
    // فلتر البحث
    const matchesSearch = !searchQuery || 
      (product.title?.en?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       product.title?.ar?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // فلتر الفئة الفرعية
    const matchesSubcategory = !subcategory || 
      (product.subCategoryId && product.subCategoryId.subcategoryId === subcategory);
    
    // فلتر السعر
    const matchesPrice = product.price >= priceRange[0] && 
      product.price <= priceRange[1];
    
    // فلتر العلامات
    const matchesTags = tags.length === 0 || 
      (product.tags && tags.every((tag) => product.tags.includes(tag)));
    
    return matchesSearch && matchesCategory && matchesSubcategory && 
      matchesPrice && matchesTags;
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

useEffect(() => {
  console.log("Current filters:", { category, subcategory, priceRange, tags });
  console.log("Sample product structure:", allProducts[0]?.subCategoryId);
}, [category, subcategory, priceRange, tags, allProducts]);

// إضافة console.log للتحقق من المنتجات والفلاتر
useEffect(() => {
  console.log("Filter values:", { category, subcategory });
  console.log("Total products:", allProducts.length);
  console.log("Filtered products:", filteredProducts.length);
  
  // فحص بنية البيانات للمنتجات
  if (allProducts.length > 0) {
    console.log("Sample product structure:", {
      id: allProducts[0].id,
      title: allProducts[0].title,
      categoryId: allProducts[0].categoryId,
      subCategoryId: allProducts[0].subCategoryId
    });
  }
  
  // فحص المنتجات التي لا تظهر في الفلتر
  if (subcategory) {
    const missingProducts = allProducts.filter(
      p => p.subCategoryId?.subcategoryId === subcategory && 
      !filteredProducts.includes(p)
    );
    console.log("Products missing from filter:", missingProducts.length);
    if (missingProducts.length > 0) {
      console.log("Sample missing product:", missingProducts[0]);
    }
  }
}, [allProducts, filteredProducts, category, subcategory]);

// إضافة تسجيل للتشخيص
useEffect(() => {
  console.log("Current category:", category);
  console.log("Total products:", allProducts.length);
  console.log("Filtered products:", filteredProducts.length);
  
  if (category) {
    const categoryProducts = allProducts.filter(p => 
      p.categoryId && p.categoryId.categoryId === category
    );
    console.log(`Products in category ${category}:`, categoryProducts.length);
  }
}, [category, allProducts, filteredProducts]);






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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center mt-5">
              <p>لا توجد منتجات في هذه الفئة</p>
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
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProductPage;
