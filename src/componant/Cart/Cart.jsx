import React, { useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Table, Image, Breadcrumb } from 'react-bootstrap';
import './CartPage.css';
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { fetchCart, updateCartQuantity, removeFromCart } from '../../Store/Slices/cartSlice';
import { fetchProducts } from '../../Store/Slices/productsSlice';
import { fetchUserData } from '../../Store/Slices/userSlice';
import { useAuth } from "../../context/AuthContext.jsx";

// Cart Item Component to avoid hooks inside map
const CartItem = ({ cartProduct, cartLoading, handleQuantityChange, handleRemoveProduct, productLoading, products }) => {
  const product = products.find(p => p.id === cartProduct.productId);

  return (
    <tr key={cartProduct.productId}>
      <td className="d-flex align-items-center">
        {productLoading && !product ? (
          <span>Loading...</span>
        ) : (
          <>
            <Image
              src={product?.mainImage || "https://via.placeholder.com/40"}
              width="40"
              height="40"
              className="me-2"
            />
            {product?.title?.en || "Product not found"}
          </>
        )}
      </td>
      <td>
        {product ? `$${(cartProduct.ItemsPrice / cartProduct.itemQuantity).toFixed(2)}` : "N/A"}
      </td>
      <td>
        <div className="d-flex align-items-center">
          <Button
            size="sm"
            variant="light"
            onClick={() => handleQuantityChange(cartProduct.productId, -1)}
            disabled={cartLoading || cartProduct.itemQuantity <= 1}
          >
            -
          </Button>
          <Form.Control
            className="mx-1 text-center"
            style={{ width: '40px' }}
            size="sm"
            value={cartProduct.itemQuantity}
            readOnly
          />
          <Button
            size="sm"
            variant="light"
            onClick={() => handleQuantityChange(cartProduct.productId, 1)}
            disabled={cartLoading}
          >
            +
          </Button>
        </div>
      </td>
      <td>${cartProduct.ItemsPrice.toFixed(2)}</td>
      <td>
        <Button
          variant="link"
          size="sm"
          className="text-danger p-0"
          onClick={() => handleRemoveProduct(cartProduct.productId)}
          disabled={cartLoading}
        >
          <FaRegTrashAlt />
        </Button>
      </td>
    </tr>
  );
};

const Cart = () => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`Cart component render count: ${renderCount.current}`);

  const { user } = useAuth();
  console.log("useAuth - user:", JSON.stringify(user, null, 2));

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartState = useSelector(state => state.cart, shallowEqual);
  const productsState = useSelector(state => state.products, shallowEqual);
  const userState = useSelector(state => state.user, shallowEqual);
  const { items: cart, loading: cartLoading, error: cartError } = cartState;
  const { items: products, loading: productLoading, error: productError } = productsState;
  const { userData, loading: userLoading, error: userError } = userState;

  // Log userState immediately after useSelector
  console.log("useSelector - userState:", JSON.stringify(userState, null, 2));
  console.log("useSelector - userData:", JSON.stringify(userData, null, 2));
  console.log("useSelector - userData.address:", JSON.stringify(userData?.address, null, 2));

  // Fetch cart, products, and user data when component mounts
  useEffect(() => {
    console.log("Cart component mounted");
    if (user && user.uid) {
      console.log("Fetching cart for userId:", user.uid);
      dispatch(fetchCart(user.uid));
      console.log("Fetching all products");
      dispatch(fetchProducts());
      console.log("Fetching user data for userId:", user.uid);
      dispatch(fetchUserData(user.uid));
    }
  }, [dispatch, user]);

  // Handle quantity change
  const handleQuantityChange = (productId, change) => {
    if (!user || !user.uid) {
      console.log("No user logged in");
      return;
    }
    console.log("Updating quantity for productId:", productId, "change:", change);
    dispatch(updateCartQuantity({ userId: user.uid, productId, change }));
  };

  // Handle remove product
  const handleRemoveProduct = (productId) => {
    if (!user || !user.uid) {
      console.log("No user logged in");
      return;
    }
    console.log("Removing productId:", productId);
    dispatch(removeFromCart({ userId: user.uid, productId }));
  };

  // Calculate cart sub-total
  const calculateSubTotal = () => {
    if (!cart || !cart.products) return 0;
    return cart.products.reduce((total, product) => total + product.ItemsPrice, 0);
  };

  // Static delivery charges (can be made dynamic later)
  const deliveryCharges = 24.00;
  const totalAmount = calculateSubTotal() + deliveryCharges;

  const goToCheckout = () => {
    if (user) {
      navigate("/checkout");
    } else {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    }
  };

  // Log Form values
  console.log("Form - userData.address:", JSON.stringify(userData?.address, null, 2));
  console.log("Form - userData.address?.length:", userData?.address?.length);
  console.log("Form - Country value:", Array.isArray(userData?.address) && userData.address.length > 0 ? userData.address[0].country : "N/A");

  if (!user) {
    return (
      <Container fluid className="p-4 border rounded">
        <div className="nav d-flex justify-content-between p-3">
          <p>Cart</p>
          <Breadcrumb>
            <Breadcrumb.Item href="/src/pages/Home.jsx">Home</Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: "#5caf90" }}>Cart</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div>Please log in to view your cart.</div>
      </Container>
    );
  }

  if (cartLoading || userLoading) {
    return (
      <Container fluid className="p-4 border rounded">
        <div className="nav d-flex justify-content-between p-3">
          <p>Cart</p>
          <Breadcrumb>
            <Breadcrumb.Item href="/src/pages/Home.jsx">Home</Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: "#5caf90" }}>Cart</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div>Loading cart and user data...</div>
      </Container>
    );
  }

  if (cartError) {
    return (
      <Container fluid className="p-4 border rounded">
        <div className="nav d-flex justify-content-between p-3">
          <p>Cart</p>
          <Breadcrumb>
            <Breadcrumb.Item href="/src/pages/Home.jsx">Home</Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: "#5caf90" }}>Cart</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div>Error: {cartError}</div>
      </Container>
    );
  }

  if (userError) {
    return (
      <Container fluid className="p-4 border rounded">
        <div className="nav d-flex justify-content-between p-3">
          <p>Cart</p>
          <Breadcrumb>
            <Breadcrumb.Item href="/src/pages/Home.jsx">Home</Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: "#5caf90" }}>Cart</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div>Error loading user data: {userError}</div>
      </Container>
    );
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <Container fluid className="p-4 border rounded">
        <div className="nav d-flex justify-content-between p-3">
          <p>Cart</p>
          <Breadcrumb>
            <Breadcrumb.Item href="/src/pages/Home.jsx">Home</Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: "#5caf90" }}>Cart</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div>Your cart is empty.</div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 border rounded">
      <div className="nav d-flex justify-content-between p-3">
        <p>Cart</p>
        <Breadcrumb>
          <Breadcrumb.Item href="/src/pages/Home.jsx">Home</Breadcrumb.Item>
          <Breadcrumb.Item active style={{ color: "#5caf90" }}>Cart</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <Row>
        {/* Sidebar on the left */}
        <Col md={4} className="mb-4">
          <div className="border rounded p-3 bg-light">
            <h5 className="fw-bold">Summary</h5>
            <p className="fw-semibold">Estimate Shipping</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                console.log("Refresh User Data clicked");
                dispatch(fetchUserData(user.uid));
              }}
              className="mb-3"
            >
              Refresh User Data
            </Button>
            <hr />
            <p className="text-body-secondary" style={{ fontSize: 12 }}>
              Enter your destination to get a shipping estimate
            </p>
            {!userData && (
              <p className="text-danger" style={{ fontSize: 12 }}>
                User data not loaded. Please try refreshing.
              </p>
            )}
            {userData && (!userData.address || userData.address.length === 0) && (
              <p className="text-danger" style={{ fontSize: 12 }}>
                No address found. Please add your address in your profile.
              </p>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: 14, fontWeight: 'bold' }}>Country</Form.Label>
                <Form.Control
                  style={{ backgroundColor: '#f8f9fa' }}
                  value={Array.isArray(userData?.address) && userData.address.length > 0 ? userData.address[0].country : "N/A"}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: 14, fontWeight: 'bold' }}>State/Province</Form.Label>
                <Form.Control
                  style={{ backgroundColor: '#f8f9fa' }}
                  value={Array.isArray(userData?.address) && userData.address.length > 0 ? userData.address[0].regionState : "N/A"}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: 14, fontWeight: 'bold' }}>Zip/Postal Code</Form.Label>
                <Form.Control
                  style={{ backgroundColor: '#f8f9fa' }}
                  value={Array.isArray(userData?.address) && userData.address.length > 0 ? userData.address[0].postalCode : "N/A"}
                  readOnly
                />
              </Form.Group>
            </Form>
            <hr />
            <div className="d-flex justify-content-between mb-2">
              <span>Sub-Total</span>
              <span>${calculateSubTotal().toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Delivery Charges</span>
              <span>${deliveryCharges.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Coupon Discount</span>
              <a href="#" className="text-decoration-underline">Apply Discount</a>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total Amount</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </Col>

        {/* Cart Items on the right */}
        <Col md={8}>
          <div className="p-3">
            {productError && <div className="text-danger mb-3">Error loading products: {productError}</div>}
            <Table responsive className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.products.map(cartProduct => (
                  <CartItem
                    key={cartProduct.productId}
                    cartProduct={cartProduct}
                    user={user}
                    cartLoading={cartLoading}
                    handleQuantityChange={handleQuantityChange}
                    handleRemoveProduct={handleRemoveProduct}
                    productLoading={productLoading}
                    products={products}
                  />
                ))}
              </tbody>
            </Table>
            <div className="mt-3 d-flex justify-content-between">
              <a href="/src/pages/Home.jsx" className="text-decoration-underline fw-medium">
                Continue Shopping
              </a>
              <Button variant="success" onClick={goToCheckout} disabled={cartLoading}>
                Check Out
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;