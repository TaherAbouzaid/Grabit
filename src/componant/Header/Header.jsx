import { useState, useEffect } from "react";
import {
  Navbar,
  Container,
  Nav,
  Button,
  Badge,
  NavDropdown,
  Offcanvas,
  Image,
  Col,
  Row,
  Form,
} from "react-bootstrap";
import {
  FaAngleDown,
  FaShoppingBag,
  FaThLarge,
  FaBars,
  FaGlobe,
} from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { PiPhoneCall } from "react-icons/pi";
import { BiHeart, BiShoppingBag, BiUser } from "react-icons/bi";
import { IoCloseSharp } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
} from "../../Store/Slices/cartSlice";
import { fetchUserData } from "../../store/Slices/userSlice";
import { fetchProducts } from "../../Store/Slices/productsSlice";
import {
  fetchUserWishlist,
  loadLocalWishlist,
} from "../../store/Slices/wishlistSlice";
import MegaMenu from "../MegaMenu/MegaMenu";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslation } from "react-i18next";
import SearchBar from "../SearchBar/SearchBar";

function Header() {
  const { user, logout } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const [expanded, setExpanded] = useState(false); // إضافة حالة للتحكم في القائمة المنسدلة
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    items: cartItems,
    loading: cartLoading,
    error: cartError,
  } = useSelector((state) => state.cart);
  const {
    items: wishlistItems,
    loading: wishlistLoading,
    error: wishlistError,
  } = useSelector((state) => state.wishlist);
  const { items: products, loading: productLoading } = useSelector(
    (state) => state.products
  );
  const { toggleLanguage, currentLanguage } = useLanguage();
  const { t } = useTranslation();

  // Debug states
  useEffect(() => {}, [
    user,
    cartItems,
    wishlistItems,
    products,
    cartError,
    wishlistError,
  ]);

  // Fetch data on mount
  useEffect(() => {
    dispatch(loadLocalWishlist()); // Load local wishlist for guests
    dispatch(fetchProducts());
    if (user?.uid) {
      dispatch(fetchUserData(user.uid));
      dispatch(fetchCart(user.uid));
      dispatch(fetchUserWishlist(user.uid));
    }
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
    if (!cartItems || !cartItems.products)
      return { subTotal: 0, vat: 0, total: 0 };
    const subTotal = cartItems.products.reduce(
      (sum, item) => sum + item.ItemsPrice,
      0
    );
    const vat = subTotal * 0.2;
    const total = subTotal + vat;
    return { subTotal, vat, total };
  };
  const { subTotal, vat, total } = calculateCartTotals();

  // Get user display name
  const getDisplayName = () => {
    if (!user || !user.fullName) return t("nav.guest");
    const name = user.fullName.split(" ")[0];
    return `${t("nav.hi")} ${name.length > 6 ? name.slice(0, 5) : name}`;
  };

  // Handle navigation with login check
  const handleNavigation = (path) => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
    // Always close the navbar when navigating
    setExpanded(false);
  };

  // Function to close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navbar = document.getElementById("main-navbar");
      const toggleButtons = document.querySelectorAll(".custom-navbar-toggler");

      // Check if navbar is expanded and click is outside navbar and toggle buttons
      if (
        expanded &&
        navbar &&
        !navbar.contains(event.target) &&
        ![...toggleButtons].some((button) => button.contains(event.target))
      ) {
        setExpanded(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded]);

  // Function to handle navbar toggle
  const toggleNavbar = () => {
    setExpanded(!expanded);

    // Force the expanded state to persist
    setTimeout(() => {
      const navbar = document.getElementById("main-navbar");
      if (navbar) {
        if (!expanded) {
          navbar.classList.add("show");
          navbar.style.height = "auto";
        } else {
          navbar.classList.remove("show");
          navbar.style.height = "0";
        }
      }
    }, 10);
  };

  // Close navbar when clicking on a link
  const handleLinkClick = (path) => {
    navigate(path);
    setExpanded(false);

    // Force close the navbar
    const navbar = document.getElementById("main-navbar");
    if (navbar) {
      navbar.classList.remove("show");
      navbar.style.height = "0";
    }
  };

  return (
    <header>
      {/* Top Bar - Only visible on large screens */}
      <div className="bg-light text-secondary py-2 small-border-bottom d-none d-lg-block">
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
          <div className="text-center small">
            World's Fastest Online Shopping Destination
          </div>
          <div className="d-flex gap-3">
            <a href="#help" className="text-secondary text-decoration-none">
              {t("nav.help")}
            </a>
            <a
              href="#track-order"
              className="text-secondary text-decoration-none"
            >
              {t("nav.trackOrder")}
            </a>
            <Button
              variant="link"
              className="text-secondary p-0 hover-dropdown"
              onClick={toggleLanguage}
            >
              {currentLanguage === "en" ? "العربية" : "English"}
            </Button>
            <NavDropdown
              title="Dollar"
              id="currency-dropdown"
              className="hover-dropdown text-secondary"
            >
              <NavDropdown.Item>USD ($)</NavDropdown.Item>
              <NavDropdown.Item>EGP (ج.م)</NavDropdown.Item>
            </NavDropdown>
          </div>
        </Container>
      </div>

      {/* Main Header */}
      <div className="py-3 border-bottom">
        <Container>
          {/* Desktop layout: Logo, Search, Icons in one row */}
          <div className="d-none d-lg-flex justify-content-between align-items-center">
            {/* Logo */}
            <div className="logo-container">
              <a
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/")}
                className="text-decoration-none d-flex align-items-center gap-2"
              >
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/logo/logo.png"
                  alt="Grabit Logo"
                  style={{ height: "35px" }}
                />
              </a>
            </div>

            {/* Search Bar */}
            <div className="search-container mx-4">
              <SearchBar />
            </div>

            {/* Icons */}
            <div className="d-flex align-items-center gap-3">
              {/* User dropdown */}
              <div className="position-relative hover-dropdown">
                <a
                  className="text-decoration-none text-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    if (user) {
                      handleNavigation("/profile");
                    } else navigate("/login");
                  }}
                >
                  <BiUser size={24} />
                  <div className="small">{getDisplayName()}</div>
                  <div className="small fw-bold">
                    {user ? t("nav.logout") : t("nav.login")}
                  </div>
                </a>
                <div className="user-dropdown">
                  {user ? (
                    <>
                      <a
                        className="dropdown-item"
                        onClick={() => handleNavigation("/OrderList")}
                      >
                        {t("nav.orders")}
                      </a>
                      <a  className="dropdown-item" onClick={logout}>
                        {t("nav.logout")}
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        onClick={() => navigate("/register")}
                        className="dropdown-item"
                      >
                        {t("nav.register")}
                      </a>
                      <a
                        onClick={() => navigate("/login")}
                        className="dropdown-item"
                      >
                        {t("nav.login")}
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center">
                <a
                  
                  className="text-decoration-none text-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/wishlist");
                  }}
                >
                  <div className="position-relative">
                    <BiHeart size={24} />
                    {wishlistLoading ? (
                      <Badge
                        bg="secondary"
                        pill
                        className="position-absolute top-0 end-0 translate-middle"
                      >
                        ...
                      </Badge>
                    ) : (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 end-0 translate-middle"
                      >
                        {wishlistItems?.length || 0}
                      </Badge>
                    )}
                  </div>
                  <div className="small">{t("nav.wishlist")}</div>
                  <div className="small fw-bold">
                    {wishlistLoading
                      ? "..."
                      : `${wishlistItems?.length || 0} ${t("common.items")}`}
                  </div>
                </a>
              </div>

              <div className="text-center" onClick={handleShow}>
                <a  className="text-decoration-none text-secondary">
                  <div className="position-relative">
                    <BiShoppingBag size={24} />
                    {cartLoading ? (
                      <Badge
                        bg="secondary"
                        pill
                        className="position-absolute top-0 end-0 translate-middle"
                      >
                        ...
                      </Badge>
                    ) : (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 end-0 translate-middle"
                      >
                        {cartItems?.products?.length || 0}
                      </Badge>
                    )}
                  </div>
                  <div className="small">{t("nav.cart")}</div>
                  <div className="small fw-bold">
                    {cartLoading
                      ? "..."
                      : `${cartItems?.products?.length || 0} ${t(
                          "common.items"
                        )}`}
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Medium screens layout: First row (Logo, Icons, Language) */}
          <div className="d-none d-md-flex d-lg-none justify-content-between align-items-center mb-3">
            {/* Logo */}
            <div className="logo-container">
              <a
                onClick={() => navigate("/")}
                className="text-decoration-none d-flex align-items-center gap-2"
              >
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/logo/logo.png"
                  alt="Grabit Logo"
                  style={{ height: "35px" }}
                />
              </a>
            </div>

            {/* Icons and Language for medium screens */}
            <div className="d-flex align-items-center gap-3">
              {/* Language toggle for medium screens */}
              <div className="text-center">
                <Button
                  variant="link"
                  className="text-decoration-none text-secondary p-0"
                  onClick={toggleLanguage}
                >
                  <div className="position-relative">
                    <FaGlobe size={24} />
                  </div>
                  <div className="small">
                    {currentLanguage === "en" ? "العربية" : "English"}
                  </div>
                </Button>
              </div>

              {/* User dropdown */}
              <div className="position-relative hover-dropdown">
                <a
                  className="text-decoration-none text-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!user) navigate("/login");
                  }}
                >
                  <BiUser size={24} />
                  <div className="small">{getDisplayName()}</div>
                  <div className="small fw-bold">
                    {user ? t("nav.logout") : t("nav.login")}
                  </div>
                </a>
                <div className="user-dropdown">
                  {user ? (
                    <>
                      <a
                        className="dropdown-item"
                        onClick={() => handleNavigation("/OrderList")}
                      >
                        {t("nav.orders")}
                      </a>
                      <a href="#" className="dropdown-item" onClick={logout}>
                        {t("nav.logout")}
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        onClick={() => navigate("/register")}
                        className="dropdown-item"
                      >
                        {t("nav.register")}
                      </a>
                      <a
                        className="dropdown-item"
                        onClick={() => navigate("/login")}
                      >
                        {t("nav.login")}
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center">
                <a
                  className="text-decoration-none text-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/wishlist");
                  }}
                >
                  <div className="position-relative">
                    <BiHeart size={24} />
                    {wishlistLoading ? (
                      <Badge
                        bg="secondary"
                        pill
                        className="position-absolute top-0 end-0 translate-middle"
                      >
                        ...
                      </Badge>
                    ) : (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 end-0 translate-middle"
                      >
                        {wishlistItems?.length || 0}
                      </Badge>
                    )}
                  </div>
                  <div className="small">{t("nav.wishlist")}</div>
                  <div className="small fw-bold">
                    {wishlistLoading
                      ? "..."
                      : `${wishlistItems?.length || 0} ${t("common.items")}`}
                  </div>
                </a>
              </div>

              <div className="text-center" onClick={handleShow}>
                <a className="text-decoration-none text-secondary">
                  <div className="position-relative">
                    <BiShoppingBag size={24} />
                    {cartLoading ? (
                      <Badge
                        bg="secondary"
                        pill
                        className="position-absolute top-0 end-0 translate-middle"
                      >
                        ...
                      </Badge>
                    ) : (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 end-0 translate-middle"
                      >
                        {cartItems?.products?.length || 0}
                      </Badge>
                    )}
                  </div>
                  <div className="small">{t("nav.cart")}</div>
                  <div className="small fw-bold">
                    {cartLoading
                      ? "..."
                      : `${cartItems?.products?.length || 0} ${t(
                          "common.items"
                        )}`}
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Medium screens layout: Second row (Search and Toggle) */}
          <div className="d-none d-md-flex d-lg-none justify-content-between align-items-center">
            {/* Search Bar */}

            {/* Custom Toggle Button for medium screens */}
            <button
              className="custom-navbar-toggler d-md-block d-lg-none"
              type="button"
              onClick={toggleNavbar}
              aria-controls="main-navbar"
              aria-expanded={expanded}
              aria-label="Toggle navigation"
            >
              {expanded ? <IoCloseSharp size={24} /> : <FaBars size={24} />}
            </button>
            <div className="search-container flex-grow-1 me-3">
              <SearchBar />
            </div>
          </div>

          {/* Mobile layout - Single row */}
          <div className="d-flex d-md-none align-items-center justify-content-between">
            {/* Logo */}
            <div className="logo-container">
              <a
                onClick={() => navigate("/")}
                className="text-decoration-none d-flex align-items-center"
              >
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/logo/logo.png"
                  alt="Grabit Logo"
                  style={{ height: "30px" }}
                />
              </a>
            </div>

            {/* Search Bar */}
            <div className="search-container flex-grow-1">
              <SearchBar />
            </div>

            {/* Toggle Button */}
            <button
              className="custom-navbar-toggler border-0 p-0"
              onClick={toggleNavbar}
              aria-controls="main-navbar"
              aria-expanded={expanded}
              aria-label="Toggle navigation"
            >
              {expanded ? <IoCloseSharp size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </Container>
      </div>

      {/* Navigation */}
      <Navbar bg="white" className="border-top border-bottom">
        <Container>
          <div className="position-relative hover-dropdown d-none d-lg-block">
            <Button
              className="rounded-0 border-0 d-flex align-items-center gap-2 px-4 py-3 all-category-btn"
              style={{
                backgroundColor: "#5cac94",
                color: "#fff",
                fontWeight: "500",
                fontSize: "18px",
              }}
              onClick={() => navigate("/shop")}
            >
              <FaThLarge className="text-white" />
              {t("nav.allCategories")}
            </Button>
          </div>

          {/* Custom Navbar Collapse */}
          <div
            id="main-navbar"
            className={`navbar-collapse collapse ${expanded ? "show" : ""}`}
            style={{
              height: expanded ? "auto" : "0",
              overflow: expanded ? "visible" : "hidden",
            }}
          >
            <Nav className="mx-auto ">
              {/* Links for medium screens - inside the toggle */}
              <div className="d-md-block d-lg-none">
                {/* Add All Categories button for medium/small screens */}
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={() => handleLinkClick("/shop")}
                  >
                    {t("nav.allCategories")}
                  </span>
                </Nav.Item>
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={() => handleLinkClick("/")}
                  >
                    {t("nav.home")}
                  </span>
                </Nav.Item>
                {/* Add Blog link for medium/small screens */}
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={() => handleLinkClick("/BlogPage")}
                  >
                    {t("nav.blog", "Blog")}
                  </span>
                </Nav.Item>
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={() => handleLinkClick("/offers")}
                  >
                    {t("nav.offers")}
                  </span>
                </Nav.Item>
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={() => handleLinkClick("/AboutUs")}
                  >
                    {t("nav.about")}
                  </span>
                </Nav.Item>
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={() => handleLinkClick("/ContactPage")}
                  >
                    {t("nav.contact")}
                  </span>
                </Nav.Item>
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={() => handleNavigation("/Cart")}
                  >
                    {t("nav.cart")}
                  </span>
                </Nav.Item>
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={() => handleNavigation("/checkout")}
                  >
                    {t("nav.checkout")}
                  </span>
                </Nav.Item>
                {/* Add User Profile link for medium/small screens */}
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={() => handleNavigation("/profile")}
                  >
                    {t("nav.profile", "Profile")}
                  </span>
                </Nav.Item>
                {/* Add Wishlist link for medium/small screens */}
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={() => handleNavigation("/wishlist")}
                  >
                    {t("nav.wishlist", "Wishlist")}
                  </span>
                </Nav.Item>
                {/* Add Language Toggle for medium/small screens */}
                <Nav.Item className="py-2">
                  <span
                    className="header-nav-item cursor-pointer"
                    onClick={toggleLanguage}
                  >
                    {currentLanguage === "en" ? "العربية" : "English"}
                  </span>
                </Nav.Item>
              </div>
            </Nav>
          </div>

          {/* Regular desktop navigation - FIXED: Always visible on large screens */}
          <div className="d-none d-lg-flex ms-4">
            <Nav.Item className="px-3 py-2">
              <span
                className="header-nav-item cursor-pointer"
                onClick={() => navigate("/")}
              >
                {t("nav.home")}
              </span>
            </Nav.Item>

            {/* Desktop Categories with MegaMenu - Hidden on mobile */}
            <div className="header-nav-dropdown px-3 py-2 d-none d-lg-block">
              <span className="header-nav-item header-nav-no-underline cursor-pointer d-flex align-items-center gap-1">
                {t("nav.categories")} <FaAngleDown size={12} />
              </span>
              <div className="header-mega-wrapper">
                <MegaMenu />
              </div>
            </div>

            {/* Mobile Categories Link - Hidden on desktop */}
            <Nav.Item className="d-lg-none px-3 py-2">
              <span
                className="header-nav-item cursor-pointer"
                onClick={() => navigate("/shop")}
              >
                {t("nav.categories")}
              </span>
            </Nav.Item>

            {/* Pages Dropdown */}
            <div className="header-nav-dropdown px-3 py-2 position-relative">
              <span className="header-nav-item cursor-pointer d-flex align-items-center gap-1">
                {t("nav.pages")} <FaAngleDown size={12} />
              </span>
              <div className="header-dropdown">
                <div
                  className="header-dropdown-item cursor-pointer"
                  onClick={() => navigate("/AboutUs")}
                >
                  {t("nav.about")}
                </div>
                <div
                  className="header-dropdown-item cursor-pointer"
                  onClick={() => navigate("/ContactPage")}
                >
                  {t("nav.contact")}
                </div>
                <div
                  className="header-dropdown-item cursor-pointer"
                  onClick={() => handleNavigation("/Cart")}
                >
                  {t("nav.cart")}
                </div>
                <div
                  className="header-dropdown-item cursor-pointer"
                  onClick={() => handleNavigation("/checkout")}
                >
                  {t("nav.checkout")}
                </div>
                <div
                  className="header-dropdown-item cursor-pointer"
                  onClick={() => handleNavigation("/OrderList")}
                >
                  {t("nav.orders")}
                </div>
                <div
                  className="header-dropdown-item cursor-pointer"
                  onClick={() => handleNavigation("/profile")}
                >
                  {t("nav.profile")}
                </div>
              </div>
            </div>

            {/* Blog Link */}
            <Nav.Item className="px-3 py-2">
              <span
                className="header-nav-item cursor-pointer"
                onClick={() => navigate("/BlogPage")}
              >
                {t("nav.blog", "Blog")}
              </span>
            </Nav.Item>

            <Nav.Item className="px-3 py-2">
              <span
                className="header-nav-item cursor-pointer d-flex align-items-center gap-2"
                onClick={() => navigate("/offers")}
              >
                <FaShoppingBag size={16} className="header-nav-icon" />
                {t("nav.offers")}
              </span>
            </Nav.Item>
          </div>
        </Container>
      </Navbar>

      {/* Cart Offcanvas */}
      <Offcanvas
        show={showCart}
        onHide={handleClose}
        placement="end"
        className="cart-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("nav.cart")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column h-100">
            <div className="mb-5 flex-grow-1 overflow-auto">
              {cartLoading || productLoading ? (
                <div className="text-center">{t("common.loading")}</div>
              ) : cartError ? (
                <div className="text-center text-danger">
                  {t("common.error")}: {cartError}
                </div>
              ) : cartItems?.products?.length > 0 ? (
                cartItems.products.map((item, idx) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <Row
                      key={item.productId || idx}
                      className="border border-secondary m-2 py-3 align-items-center"
                    >
                      <Col xs={3}>
                        <Image
                          src={
                            product?.mainImage ||
                            "https://via.placeholder.com/60"
                          }
                          width="60"
                          height="60"
                          className="me-2"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/60")
                          }
                        />
                      </Col>
                      <Col xs={6}>
                        <h5>
                          {product?.title?.[currentLanguage] ||
                            t("common.unknownProduct")}
                        </h5>
                        <h6>${item.ItemsPrice.toFixed(2)}</h6>
                        <div className="d-flex align-items-center">
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() =>
                              handleQuantityChange(item.productId, -1)
                            }
                            disabled={item.itemQuantity <= 1 || cartLoading}
                          >
                            -
                          </Button>
                          <Form.Control
                            className="mx-1 text-center"
                            style={{ width: "40px" }}
                            size="sm"
                            value={item.itemQuantity}
                            readOnly
                          />
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() =>
                              handleQuantityChange(item.productId, 1)
                            }
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
                <div className="text-center text-muted">{t("cart.empty")}</div>
              )}
            </div>

            <div className="p-3">
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>{t("common.subtotal")}</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>{t("common.vat")}</span>
                <span>${vat.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span>{t("common.totalAmount")}</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="mt-3 d-flex justify-content-between">
                <Button
                  size="lg"
                  className="px-5"
                  variant="secondary"
                  onClick={() => handleNavigation("/cart")}
                >
                  {t("nav.viewCart")}
                </Button>
                <Button
                  size="lg"
                  className="px-5"
                  variant="success"
                  onClick={goToCheckout}
                  disabled={!cartItems?.products?.length || cartLoading}
                >
                  {t("nav.checkout")}
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
