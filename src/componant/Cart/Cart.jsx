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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
      <Container className="py-5 text-center">
        <h2>{t('cart.loginRequired')}</h2>
        <Button variant="primary" onClick={() => navigate('/login')}>
          {t('nav.login')}
        </Button>
      </Container>
    );
  }

  if (cartLoading || userLoading) {
    return (
      <Container className="py-5 text-center">
        <h2>{t('common.loading')}</h2>
      </Container>
    );
  }

  if (cartError) {
    return (
      <Container className="py-5 text-center">
        <h2>{t('common.error')}</h2>
        <p>{cartError}</p>
      </Container>
    );
  }

  if (userError) {
    return (
      <Container className="py-5 text-center">
        <h2>{t('common.error')}</h2>
        <p>{userError}</p>
      </Container>
    );
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h2>{t('cart.empty')}</h2>
        <Button
          variant="primary"
          className="mt-3"
          onClick={() => navigate('/shop')}
        >
          {t('common.continueShopping')}
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">{t('nav.cart')}</h1>
      <Row>
        <Col md={8}>
          {productError && <div className="text-danger mb-3">{t('common.errorLoadingProducts')}: {productError}</div>}
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
            <a href="/" className="text-decoration-underline fw-medium">
              {t('common.continueShopping')}
            </a>
            <Button variant="success" onClick={goToCheckout} disabled={cartLoading}>
              {t('nav.checkout')}
            </Button>
          </div>
        </Col>
        <Col md={4}>
          <div className="border p-3">
            <h4 className="mb-3">{t('cart.orderSummary')}</h4>
            <div className="d-flex justify-content-between mb-2">
              <span>{t('common.subtotal')}</span>
              <span>${calculateSubTotal().toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>{t('common.vat')}</span>
              <span>${(calculateSubTotal() * 0.2).toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold mb-3">
              <span>{t('common.totalAmount')}</span>
              <span>${(calculateSubTotal() + (calculateSubTotal() * 0.2)).toFixed(2)}</span>
            </div>
            <Button
              variant="primary"
              className="w-100"
              onClick={goToCheckout}
            >
              {t('nav.checkout')}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;