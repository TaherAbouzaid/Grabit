import { useState, useEffect } from "react";
import { Navbar, Container, Nav, Form, Button, InputGroup, Badge, NavDropdown, Offcanvas, Image, Col, Row } from "react-bootstrap";
import { FaAngleDown, FaShoppingBag, FaThLarge } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { PiPhoneCall } from "react-icons/pi";
import { BiHeart, BiSearch, BiShoppingBag, BiUser } from "react-icons/bi";
import { IoCloseSharp } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery } from '../../Store/Slices/filtersSlice';
import { fetchCart, updateCartQuantity, removeFromCart } from '../../Store/Slices/cartSlice';
import { fetchUserData } from '../../Store/Slices/userSlice';
import { fetchProducts } from '../../Store/Slices/productsSlice';
import MegaMenu from "../MegaMenu/MegaMenu";

function Header() {
  const { user, logout } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems, loading: cartLoading } = useSelector(state => state.cart);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { userData } = useSelector(state => state.user);
  const { items: products, loading: productLoading } = useSelector(state => state.products);


  // Debug cart and products
  useEffect(() => {
    console.log('cartItems:', cartItems);
    console.log('products:', products);
  }, [cartItems, products]);

  // Fetch user data, cart, and products on mount if user is logged in
  useEffect(() => {
    if (user && user.uid) {
      dispatch(fetchUserData(user.uid));
      dispatch(fetchCart(user.uid));
    }
    dispatch(fetchProducts()); // Fetch products for all users
  }, [user, dispatch]);

  // Handle Offcanvas show/hide
  const handleShow = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }
    setShowCart(true);
  };
  const handleClose = () => setShowCart(false);

  // Navigate to checkout
  const goToCheckout = () => {
    if (user) {
      navigate("/checkout");
    } else {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    }
  };

  // Handle search query
  const handleSearchChange = (e) => {
    console.log('search query:', e.target.value);
    dispatch(setSearchQuery(e.target.value));
  };

  // Handle quantity change
  const handleQuantityChange = (productId, change) => {
    if (user && cartItems?.cartId) {
      dispatch(updateCartQuantity({ userId: user.uid, productId, change }));
    }
  };

  // Handle remove item
  const handleRemoveItem = (productId) => {
    if (user && cartItems?.cartId) {
      dispatch(removeFromCart({ userId: user.uid, productId }));
    }
  };

  // Calculate cart totals
  const calculateCartTotals = () => {
    if (!cartItems || !cartItems.products) return { subTotal: 0, vat: 0, total: 0 };
    const subTotal = cartItems.products.reduce((sum, item) => sum + item.ItemsPrice, 0);
    const vat = subTotal * 0.2;
    const total = subTotal + vat;
    return { subTotal, vat, total };
  };
  const { subTotal, vat, total } = calculateCartTotals();

  // Get user display name
  const getDisplayName = () => {
    if (!user || !userData?.fullName) return "Hi! Guest";
    const name = userData.fullName.split(" ")[0];
    return `Hi! ${name.length > 6 ? name.slice(0, 5) : name}`;
  };

  // Handle navigation with login check
  const handleNavigation = (path) => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
  };

  

  return (
    <header>
      {/* Top Bar */}
      <div className="bg-light text-secondary py-2 small-border-bottom">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-4">
            <div className="d-flex align-items-center gap-2">
              <PiPhoneCall size={16} />
              <span>+20 10322 70 55</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <BsWhatsapp size={16} />
              <span>+20 1033 333 44</span>
            </div>
          </div>
          <div className="text-center small">World's Fastest Online Shopping Destination</div>
          <div className="d-flex gap-3">
            <a href="#help" className="text-secondary text-decoration-none">Help?</a>
            <a href="#track-order" className="text-secondary text-decoration-none">Track Order</a>
            <NavDropdown title="English" id="language-dropdown" className="hover-dropdown text-secondary">
              <NavDropdown.Item>English</NavDropdown.Item>
              <NavDropdown.Item>العربية</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Dollar" id="currency-dropdown" className="hover-dropdown text-secondary">
              <NavDropdown.Item>USD ($)</NavDropdown.Item>
              <NavDropdown.Item>EGP (ج.م)</NavDropdown.Item>
            </NavDropdown>
          </div>
        </Container>
      </div>

      {/* Main Header */}
      <div className="py-3 border-bottom">
        <Container className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          {/* Logo */}
          <a href="/" className="text-decoration-none d-flex align-items-center gap-2">
            <img
              src="https://grabit-react-next.maraviyainfotech.com/assets/img/logo/logo.png"
              alt="Grabit Logo"
              style={{ height: "35px" }}
            />
          </a>

          {/* Search Bar */}
          <div className="search-bar-container">
            <InputGroup className="search-bar-group">
              <Form.Control
                type="text"
                placeholder="Search Products..."
                onChange={handleSearchChange}
                className="search-input"
              />
              <Button variant="light" className="search-button">
                <BiSearch size={20} color="#5cac94" />
              </Button>
            </InputGroup>
          </div>

          {/* User Icons */}
          <div className="d-flex gap-4 user-actions">
            <div className="user-hover">
              <a
                href="#"
                className="text-decoration-none text-secondary text-center"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/profile");
                }}
              >
                <BiUser size={24} />
                <div className="small">{getDisplayName()}</div>
                <div className="small fw-bold">{user ? "LOGOUT" : "LOGIN"}</div>
              </a>
              <div className="user-dropdown">
                {user ? (
                  <>
                    <a href="/OrderList" className="dropdown-item" onClick={() => handleNavigation("/OrderList")}>Orders</a>
                    <a href="#" className="dropdown-item" onClick={logout}>Logout</a>
                  </>
                ) : (
                  <>
                    <a href="/register" className="dropdown-item">Register</a>
                    <a href="/login" className="dropdown-item">LogIn</a>
                  </>
                )}
              </div>
            </div>

            <div className="text-center">
              <a
                href="#"
                className="text-decoration-none text-secondary"
                onClick={() => {
                  navigate("/wishlist");
                }}
              >
                <div className="position-relative">
                  <BiHeart size={24} />
                  <Badge bg="danger" pill className="position-absolute top-0 end-0 translate-middle">
                    {wishlistItems?.length || 0}
                  </Badge>
                </div>
                <div className="small">Wishlist</div>
                <div className="small fw-bold">{wishlistItems?.length || 0} ITEMS</div>
              </a>
            </div>

            <div className="text-center" onClick={handleShow}>
              <a href="#" className="text-decoration-none text-secondary">
                <div className="position-relative">
                  <BiShoppingBag size={24} />
                  <Badge bg="danger" pill className="position-absolute top-0 end-0 translate-middle">
                    {cartItems?.products?.length || 0}
                  </Badge>
                </div>
                <div className="small">Cart</div>
                <div className="small fw-bold">{cartItems?.products?.length || 0} ITEMS</div>
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Navigation */}
      <Navbar bg="white" expand="lg" className="border-top border-bottom">
        <Container>
          <div className="position-relative hover-dropdown">
            <Button
              className="rounded-0 border-0 d-flex align-items-center gap-2 px-4 py-3 all-category-btn"
              style={{ backgroundColor: "#5cac94", color: "#fff", fontWeight: "500", fontSize: "18px" }}
            >
              <FaThLarge className="text-white" />
              All Categories
            </Button>
            <div className="dropdown-menu position-absolute mt-0">
              <a href="#fruits" className="dropdown-item">Fruits</a>
              <a href="#vegetables" className="dropdown-item">Vegetables</a>
              <a href="#meat" className="dropdown-item">Meat & Seafood</a>
              <a href="#drinks" className="dropdown-item">Drinks</a>
              <a href="#snacks" className="dropdown-item">Snacks</a>
            </div>
          </div>

          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="mx-auto">
              <div className="hover-dropdown px-3 py-3 position-relative nav-item-with-dropdown">
                <span className="nav-link d-flex align-items-center gap-1 text-dark dropdown-toggle-custom">
                  Home <span className="dropdown-arrow">▼</span>
                </span>
                <div className="dropdown-menu position-absolute">
                  <a href="#home1" className="dropdown-item">Grocery</a>
                  <a href="#home2" className="dropdown-item">Fashion</a>
                  <a href="#home2" className="dropdown-item">Fashion 2</a>
                </div>
              </div>

              <div className="hover-dropdown px-3 py-3 position-relative nav-item-with-dropdown">
                <span className="nav-link d-flex align-items-center gap-1 text-dark dropdown-toggle-custom">
                  Categories <FaAngleDown size={12} />
                </span>
                <MegaMenu />
              </div>

              <div className="hover-dropdown px-3 py-3 position-relative nav-item-with-dropdown">
                <span className="nav-link d-flex align-items-center gap-1 text-dark dropdown-toggle-custom">
                  Blog <FaAngleDown size={12} /> 
                </span >
                <div className="dropdown-menu position-absolute">
                  <a href="#blog1" className="dropdown-item">Latest Posts</a>
                  <a href="#blog2" className="dropdown-item">Tips & Tricks</a>
                </div>
              </div>

              <div className="hover-dropdown px-3 py-3 position-relative nav-item-with-dropdown">
                <span className="nav-link d-flex align-items-center gap-1 text-dark dropdown-toggle-custom">
                  Pages <FaAngleDown size={12} />
                </span>
                <div className="dropdown-menu position-absolute">
                  <a href="#about" className="dropdown-item">About Us</a>
                  <a href="#contact" className="dropdown-item" onClick={() => handleNavigation("/ContactPage")}>Contact Us</a>
                  <a href="#" className="dropdown-item" onClick={() => handleNavigation("/Cart")}>Cart</a>
                  <a href="#" className="dropdown-item" onClick={() => handleNavigation("/checkout")}>Checkout</a>
                  <a href="#" className="dropdown-item" onClick={() => handleNavigation("/OrderList")}>Orders</a>
                  <a href="#compare" className="dropdown-item">Compare</a>
                  <a href="#faq" className="dropdown-item">FAQ</a>
                  <a href="/login" className="dropdown-item">Login</a>
                </div>
              </div>

              <Nav.Link href="#offers" className="d-flex align-items-center gap-2 px-3 py-3">
                <FaShoppingBag size={16} />
                Offers
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Cart Offcanvas */}
      <Offcanvas show={showCart} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>My Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column h-100">
            <div className="mb-5 flex-grow-1">
              {cartLoading || productLoading ? (
                <div className="text-center">Loading cart...</div>
              ) : cartItems?.products?.length > 0 ? (
                cartItems.products.map((item, idx) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <Row key={item.productId || idx} className="border border-secondary m-2 py-3 align-items-center">
                      <Col xs={3}>
                        <Image
                          src={product?.mainImage || "https://via.placeholder.com/60"}
                          width="60"
                          height="60"
                          className="me-2"
                          onError={(e) => (e.target.src = "https://via.placeholder.com/60")}
                        />
                      </Col>
                      <Col xs={6}>
                        <h5>{product?.title?.en || "Unknown Product"}</h5>
                        <h6>${item.ItemsPrice.toFixed(2)}</h6>
                        <div className="d-flex align-items-center">
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => handleQuantityChange(item.productId, -1)}
                            disabled={item.itemQuantity <= 1 || cartLoading}
                          >
                            -
                          </Button>
                          <Form.Control
                            className="mx-1 text-center"
                            style={{ width: '40px' }}
                            size="sm"
                            value={item.itemQuantity}
                            readOnly
                          />
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => handleQuantityChange(item.productId, 1)}
                            disabled={cartLoading}
                          >
                            +
                          </Button>
                        </div>
                      </Col>
                      <Col xs={3} className="d-flex justify-content-end">
                        <IoCloseSharp
                          size={20}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemoveItem(item.productId)}
                        />
                      </Col>
                    </Row>
                  );
                })
              ) : (
                <div className="text-center text-muted">Your cart is empty.</div>
              )}
            </div>

            <div className="p-3">
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Sub-Total</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>VAT (20%)</span>
                <span>${vat.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span>Total Amount</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="mt-3 d-flex justify-content-between">
                <Button
                  size="lg"
                  className="px-5"
                  variant="secondary"
                  onClick={() => handleNavigation("/cart")}
                >
                  View Cart
                </Button>
                <Button
                  size="lg"
                  className="px-5"
                  variant="success"
                  onClick={goToCheckout}
                  disabled={!cartItems?.products?.length || cartLoading}
                >
                  Check Out
                </Button>
              </div>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
}

export default Header;