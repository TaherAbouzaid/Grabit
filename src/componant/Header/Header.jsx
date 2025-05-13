import { useState } from "react";
import { Navbar, Container, Nav, Form, Button, InputGroup, Badge, NavDropdown, Dropdown, Offcanvas, Image, Col, Row, } from "react-bootstrap";
import { FaShoppingBag, FaThLarge, } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { PiPhoneCall } from "react-icons/pi";
import { BiHeart, BiSearch, BiShoppingBag, BiUser } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";
import { IoCloseSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setSearchQuery } from '../../Store/Slices/filtersSlice';

function Header() {
  const { user, logout } = useAuth();
  const [showcart, setShowcart] = useState(false);
  const handleClose = () => setShowcart(false);
  const handleShow = () => setShowcart(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();


     const goToCheckout = () => {
      if (user) {
        navigate("/checkout");
    } else {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    }
  };

    const handleSearchChange = (e) => {
        console.log('search query:', e.target.value);

    dispatch(setSearchQuery(e.target.value));
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

            <div className="text-center" onClick={handleShow}>
              <a  className="text-decoration-none text-secondary"
               
              >
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
        <Offcanvas show={showcart} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>My Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
         <div className="d-flex flex-column ">

          <div className="mb-5">
              {[
                  { name: "Women's wallet Hand Purse", price: 50,image: 'https://grabit-react-next.maraviyainfotech.com/assets/img/product-images/48_1.jpg' },
                  { name: "Rose Gold Earring", price: 60, image: 'https://grabit-react-next.maraviyainfotech.com/assets/img/product-images/53_1.jpg' },
                  { name: 'Apple', price: 10, image: 'https://grabit-react-next.maraviyainfotech.com/assets/img/product-images/21_1.jpg' },
                ].map((item, idx) => (
                  <Row key={idx} className="border border-secondry m-2 py-3">
                    <Col>
                        <Image src={item.image} width="60" height="60" className="me-2" />
                    </Col>
                    <Col>
                       <h5>{item.name}</h5>
                       <h6>${item.price}</h6>
                       <div className="d-flex align-items-center ">
                          <Button size="sm" variant="light">-</Button>
                          <Form.Control className="mx-1 text-center" style={{ width: '40px' }} size="sm" value="1" readOnly />
                          <Button size="sm" variant="light">+</Button>
                        </div>
                    </Col>
                    <Col className="d-flex justify-content-end ">
                          <IoCloseSharp />
                    </Col>
                  </Row>
                ))}
          </div>

          <div className="p-3">
            <hr />
            <div className="d-flex justify-content-between mb-2">
              <span>Sub-Total</span>
              <span>$120.00</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Vate(20%)</span>
              <span>$24.00</span>
            </div>
            <div className="d-flex justify-content-between fw-bold">
              <span>Total Amount</span>
              <span>$144.00</span>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <Button size="lg" className="px-5" variant="secondary " href="/Cart">View Cart</Button>
              <Button size="lg" className="px-5" variant="success"  onClick={goToCheckout}>Check Out</Button>
           
            </div>

          </div>
        </div>



        </Offcanvas.Body>
      </Offcanvas>

    </header>
  );
}
export default Header;