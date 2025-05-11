import { useState } from "react";
import { Navbar, Container, Nav, Form, Button, InputGroup, Badge, NavDropdown, Dropdown,} from "react-bootstrap";
import { FaShoppingBag, FaThLarge } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { PiPhoneCall } from "react-icons/pi";
import { BiHeart, BiSearch, BiShoppingBag, BiUser } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import "./Header.css";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { user, logout } = useAuth();


  //  function search
  const handleSearch = async (queryValue) => {
    const input = queryValue.trim().toLowerCase();

    if (!input) {
      setFilteredProducts([]);
      return;
    }
    try {
      const querySnapshot = await getDocs(collection(db, "allproducts"));
      const allProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filtered = allProducts.filter(product => {
        const title = product.title?.en || "";
        return title.toLowerCase().includes(input);
      });

      setFilteredProducts(filtered);
    } catch (error) {
      console.error("Search failed:", error);
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
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="search-input"
              />
              <Button variant="light" className="search-button" onClick={handleSearch}>
                <BiSearch size={20} color="#5cac94" />
              </Button>
            </InputGroup>
          </div>

          {/* User Icons */}
          <div className="d-flex gap-4 user-actions">
            <div className="user-hover">
              <a href="/account" className="text-decoration-none text-secondary text-center">
                <BiUser size={24} />
                <div className="small">Account</div>
                <div className="small fw-bold">{user ? "LOGOUT" : "LOGIN"}</div>
              </a>
              <div className="user-dropdown">
                {user ? (
                  <>
                    <a href="/orders" className="dropdown-item">Checkout</a>
                    <a href="/Home" className="dropdown-item" onClick={logout}>Logout</a>
                  </>
                ) : (
                  <>
                    <a href="/register" className="dropdown-item">Register</a>
                    <a href="/orders" className="dropdown-item">Checkout</a>
                    <a href="/login" className="dropdown-item">LogIn</a>
                  </>
                )}
              </div>
            </div>

            <div className="text-center">
              <a href="/wishlist" className="text-decoration-none text-secondary">
                <div className="position-relative">
                  <BiHeart size={24} />
                  <Badge bg="danger" pill className="position-absolute top-0 end-0 translate-middle">
                    3
                  </Badge>
                </div>
                <div className="small">Wishlist</div>
                <div className="small fw-bold">3 ITEMS</div>
              </a>
            </div>

            <div className="text-center">
              <a href="/cart" className="text-decoration-none text-secondary">
                <div className="position-relative">
                  <BiShoppingBag size={24} />
                  <Badge bg="danger" pill className="position-absolute top-0 end-0 translate-middle">
                    2
                  </Badge>
                </div>
                <div className="small">Cart</div>
                <div className="small fw-bold">2 ITEMS</div>
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* search filter */}

      {filteredProducts.length > 0 && (
        <Container className="my-4">
          <h5>Search Results:</h5>
          <div className="d-flex flex-wrap gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border p-3 rounded text-center"
                style={{ width: "200px" }}
              >
                <img
                  src={product.mainImage || "/default-image.png"}
                  alt={product.title?.en || "Product Image"}
                  style={{ width: "100%", height: "150px", objectFit: "cover" }}
                />
                <h6 className="mt-2">{product.title?.en || "No name available"}</h6>
                {product.discountPrice ? (
                  <p className="fw-bold">
                    <span className="text-danger me-2 text-decoration-line-through">
                      {product.price}$
                    </span>
                    <span className="text-success">{product.discountPrice}$</span>
                  </p>
                ) : (
                  <p className="text-success fw-bold">{product.price}$</p>
                )}

              </div>
            ))}
          </div>
        </Container>
      )}

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
                <a href="/" className="nav-link d-flex align-items-center gap-1 text-dark dropdown-toggle-custom position-relative">
                  Home <span className="dropdown-arrow">▼</span>
                </a>
                <div className="dropdown-menu position-absolute">
                  <a href="#home1" className="dropdown-item">Grocery</a>
                  <a href="#home2" className="dropdown-item">Fashion</a>
                  <a href="#home2" className="dropdown-item">Fashion 2</a>
                </div>
              </div>

              <div className="hover-dropdown px-3 py-3 position-relative nav-item-with-dropdown">
                <span className="nav-link d-flex align-items-center gap-1 text-dark dropdown-toggle-custom">
                  Categories <span className="dropdown-arrow">▼</span>
                </span>
                <div className="dropdown-menu position-absolute">
                  <a href="#cat1" className="dropdown-item">Fruits</a>
                  <a href="#cat2" className="dropdown-item">Vegetables</a>
                  <a href="#cat3" className="dropdown-item">Meat</a>
                </div>
              </div>

              <div className="hover-dropdown px-3 py-3 position-relative nav-item-with-dropdown">
                <span className="nav-link d-flex align-items-center gap-1 text-dark dropdown-toggle-custom">
                  Blog <span className="dropdown-arrow">▼</span>
                </span>
                <div className="dropdown-menu position-absolute">
                  <a href="#blog1" className="dropdown-item">Latest Posts</a>
                  <a href="#blog2" className="dropdown-item">Tips & Tricks</a>
                </div>
              </div>

              <div className="hover-dropdown px-3 py-3 position-relative nav-item-with-dropdown">
                <span className="nav-link d-flex align-items-center gap-1 text-dark dropdown-toggle-custom">
                  Pages <span className="dropdown-arrow">▼</span>
                </span>
                <div className="dropdown-menu position-absolute">
                  <a href="#about" className="dropdown-item">About Us</a>
                  <a href="#contact" className="dropdown-item">Contact Us</a>
                  <a href="#contact" className="dropdown-item">Cart</a>
                  <a href="#contact" className="dropdown-item">Cheackout</a>
                  <a href="#contact" className="dropdown-item">Orders </a>
                  <a href="#contact" className="dropdown-item">Compare</a>
                  <a href="#contact" className="dropdown-item">FAQ</a>
                  <a href="#contact" className="dropdown-item">Login</a>
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
    </header>
  );
}

export default Header;
