import React, { useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Image,
  Breadcrumb,
} from "react-bootstrap";
import "./CartPage.css";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
} from "../../Store/Slices/cartSlice";
import { fetchProducts } from "../../Store/Slices/productsSlice";
import { fetchUserData } from "../../Store/Slices/userSlice";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";

// Cart Item Component to avoid hooks inside map
const CartItem = ({
  cartProduct,
  cartLoading,
  handleQuantityChange,
  handleRemoveProduct,
  productLoading,
  products,
}) => {
  // Find the product from the products list (needed for base product info)
  const product = products.find((p) => p.id === cartProduct.productId);
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <tr key={cartProduct.productId + (cartProduct.variantId || "")}>
      <td className="d-flex align-items-center">
        {productLoading ? (
          <span>Loading...</span>
        ) : product ? (
          <>
            <Image
              // Use cartProduct.mainImage for variants, fallback to product?.mainImage for simple products
              src={
                cartProduct.mainImage ||
                product?.mainImage ||
                "https://via.placeholder.com/40"
              }
              width="40"
              height="40"
              className="me-2"
            />
            {/* Use item.title (localized from object) for variants, fallback to product title for simple products */}
            {cartProduct.title?.[currentLanguage] ||
              cartProduct.title?.en ||
              product?.title?.[currentLanguage] ||
              product?.name?.[currentLanguage] ||
              product?.title?.en ||
              product?.name?.en ||
              "Product not found"}
            {/* Add variant attributes if available */}
            {cartProduct.variantAttributes &&
              Object.keys(cartProduct.variantAttributes).length > 0 && (
                <small className="text-muted ms-2">
                  (
                  {Object.entries(cartProduct.variantAttributes)
                    .map(([key, value]) => `${t(key)}: ${value}`)
                    .join(", ")}
                  )
                </small>
              )}
          </>
        ) : (
          <span>Product not found</span>
        )}
      </td>
      <td>
        {/* Revert price calculation to use ItemsPrice and itemQuantity */}
        {productLoading
          ? "Loading..."
          : `$${(cartProduct.ItemsPrice / cartProduct.itemQuantity).toFixed(
              2
            )}`}
      </td>
      <td>
        <div className="d-flex align-items-center">
          <Button
            size="sm"
            variant="light"
            onClick={() => handleQuantityChange(cartProduct.productId, -1)}
            disabled={cartLoading || cartProduct.itemQuantity <= 1}
          >
            {cartLoading ? <span className="spinner-border spinner-border-sm" /> : "-"}
          </Button>
          <Form.Control
            className="mx-1 text-center"
            style={{ width: "40px" }}
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
            {cartLoading ? <span className="spinner-border spinner-border-sm" /> : "+"}
          </Button>
        </div>
      </td>
      <td>
        {/* Use ItemsPrice for the total column */}$
        {cartProduct.ItemsPrice.toFixed(2)}
      </td>
      <td>
        <Button
          variant="link"
          size="sm"
          className="text-danger p-0"
          onClick={() => handleRemoveProduct(cartProduct.productId)}
          disabled={cartLoading}
        >
          {cartLoading ? <span className="spinner-border spinner-border-sm" /> : <FaRegTrashAlt />}
        </Button>
      </td>
    </tr>
  );
};

const Cart = () => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const { user } = useAuth();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state.cart, shallowEqual);
  const productsState = useSelector((state) => state.products, shallowEqual);
  const userState = useSelector((state) => state.user, shallowEqual);
  const { items: cart, loading: cartLoading, error: cartError } = cartState;
  const {
    items: products,
    loading: productLoading,
    error: productError,
  } = productsState;
  const { loading: userLoading, error: userError } = userState;
  const { t } = useTranslation();

  // Log userState immediately after useSelector

  // Fetch cart, products, and user data when component mounts
  useEffect(() => {
    if (user && user.uid) {
      dispatch(fetchCart(user.uid));
      dispatch(fetchProducts());
      dispatch(fetchUserData(user.uid));
    }
  }, [dispatch, user]);

  // Handle quantity change
  const handleQuantityChange = (productId, variantId, change) => {
    if (!user || !user.uid) {
      return;
    }
    const itemToUpdate = cart.products.find(
      (p) => p.productId === productId && p.variantId === variantId
    );
    if (itemToUpdate) {
      dispatch(
        updateCartQuantity({
          userId: user.uid,
          productId,
          variantId,
          change,
        })
      );
    }
  };

  // Handle remove product
  const handleRemoveProduct = (productId, variantId) => {
    if (!user || !user.uid) {
      return;
    }
    const itemToRemove = cart.products.find(
      (p) => p.productId === productId && p.variantId === variantId
    );
    if (itemToRemove) {
      dispatch(
        removeFromCart({
          userId: user.uid,
          productId,
          variantId,
        })
      );
    }
  };

  // Calculate cart sub-total
  const calculateSubTotal = () => {
    if (!cart || !cart.products) return 0;
    return cart.products.reduce(
      (total, product) => total + product.ItemsPrice,
      0
    );
  };

  // Static delivery charges (can be made dynamic later)
  // const deliveryCharges = 24.00;

  const goToCheckout = () => {
    if (user) {
      navigate("/checkout");
    } else {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    }
  };

  // Log Form values

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <h2>{t("cart.loginRequired")}</h2>
        <Button variant="primary" onClick={() => navigate("/login")}>
          {t("nav.login")}
        </Button>
      </Container>
    );
  }

  if ((cartLoading && !cart) || userLoading) {
    return (
      <Container className="py-5 text-center">
        <h2>{t("common.loading")}</h2>
      </Container>
    );
  }

  if (cartError) {
    return (
      <Container className="py-5 text-center">
        <h2>{t("common.error")}</h2>
        <p>{cartError}</p>
      </Container>
    );
  }

  if (userError) {
    return (
      <Container className="py-5 text-center">
        <h2>{t("common.error")}</h2>
        <p>{userError}</p>
      </Container>
    );
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h2>{t("cart.empty")}</h2>
        <Button
          variant="primary"
          className="mt-3"
          onClick={() => navigate("/shop")}
        >
          {t("common.continueShopping")}
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">{t("nav.cart")}</h1>
      <Row>
        <Col md={8}>
          {productError && (
            <div className="text-danger mb-3">
              {t("common.errorLoadingProducts")}: {productError}
            </div>
          )}
          <Table responsive className="align-middle mb-0">
            <thead>
              <tr>
                <th>{t("cart.product")}</th>
                <th>{t("cart.price")}</th>
                <th>{t("cart.quantity")}</th>
                <th>{t("cart.total")}</th>
                <th>{t("cart.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {cart.products.map((cartProduct) => (
                <CartItem
                  key={cartProduct.productId + (cartProduct.variantId || "")}
                  cartProduct={cartProduct}
                  user={user}
                  cartLoading={cartLoading}
                  handleQuantityChange={(productId, change) =>
                    handleQuantityChange(
                      productId,
                      cartProduct.variantId,
                      change
                    )
                  }
                  handleRemoveProduct={(productId) =>
                    handleRemoveProduct(productId, cartProduct.variantId)
                  }
                  productLoading={productLoading}
                  products={products}
                />
              ))}
            </tbody>
          </Table>
          <div className="mt-3 d-flex justify-content-between">
            <a
              onClick={() => navigate("/shop")}
              className="text-decoration-underline fw-medium"
            >
              {t("common.continueShopping")}
            </a>
            <Button
              variant="success"
              onClick={goToCheckout}
              disabled={cartLoading}
            >
              {t("nav.checkout")}
            </Button>
          </div>
        </Col>
        <Col md={4}>
          <div className="border p-3">
            <h4 className="mb-3">{t("cart.orderSummary")}</h4>
            <div className="d-flex justify-content-between mb-2">
              <span>{t("common.subtotal")}</span>
              <span>${calculateSubTotal().toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>{t("common.vat")}</span>
              <span>${(calculateSubTotal() * 0.14).toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold mb-3">
              <span>{t("common.totalAmount")}</span>
              <span>
                ${(calculateSubTotal() + calculateSubTotal() * 0.14).toFixed(2)}
              </span>
            </div>
            <Button variant="primary" className="w-100" onClick={goToCheckout}>
              {t("nav.checkout")}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
