

import React, { useEffect } from 'react';
import { Container, Table, Button, Row, Col, Image, Breadcrumb } from 'react-bootstrap';
import { IoCloseSharp } from "react-icons/io5";
import { GiGymBag } from "react-icons/gi";
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Wishlist.css';
import { fetchUserWishlist, loadLocalWishlist, removeFromLocalWishlist, removeFromWishlist } from '../../Store/Slices/wishlistSlice';
import { addToCart } from '../../Store/Slices/cartSlice';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items: wishlistItems, error } = useSelector((state) => state.wishlist);
  const { loading: cartLoading } = useSelector((state) => state.cart);
  const navigate = useNavigate();



  // ✅ تحميل wishlist من localStorage أو Firestore
  useEffect(() => {
    if (user) {
      dispatch(fetchUserWishlist(user.uid));
    } else {
      dispatch(loadLocalWishlist());
    }
  }, [user, dispatch]);

  // ✅ عرض toast إذا كان المنتج موجود بالفعل
  useEffect(() => {
    if (error === "Product already in wishlist") {
      toast.warn("Product is already in your wishlist!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);



  // ✅ إزالة منتج من الـ wishlist
  const handleRemoveItem = (productId) => {
    if (user) {
      dispatch(removeFromWishlist({ productId, userId: user.uid }));
    } else {
      dispatch(removeFromLocalWishlist(productId));
    }
    console.log("Remove item with ID:", productId);
  };

  // ✅ إضافة منتج إلى الـ cart
  const handleAddToCart = (item) => {
    if (cartLoading) return;
    dispatch(addToCart({
      userId: user?.uid || null,
      productId: item.id,
      price: item.price,
    }));
    toast.success(`${item.title?.en} added to cart!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <Container fluid className="p-4">
      <ToastContainer />
      <div className="nav d-flex justify-content-between p-3">
        <p>Wishlist</p>
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item active style={{ color: "#5caf90" }}>Wishlist</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Row className="wishlist-header">
        <Col>
          <h2 className="text-center fw-bold">
            Product <span>Wishlist</span>
          </h2>
          <p className="text-center text-muted">Your product wish is our first priority.</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="wishlist-card border rounded p-3 bg-white shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">WISHLIST</h5>
              <Button variant="success">Shop Now</Button>
            </div>

            <Table responsive hover className="wishlist-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.length > 0 ? (
                  wishlistItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Image src={item.mainImage} width="50" />
                      </td>
                      <td>{item.title?.en}</td>
                      <td>${item.price}</td>
                      <td className="text-success">Available</td>
                      <td>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() =>{
                            if(!user)
                               {
                              toast.error("Please login to add items to cart!", {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                
                              })
                              navigate("/login")
                            
                            } else {
                             handleAddToCart(item)}
                              // disabled={cartLoading}
                          } }
                          >
                          <GiGymBag />
                        </Button>
                        <Button
                          variant="dark"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <IoCloseSharp className="Color-white" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No items in your wishlist.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Wishlist;