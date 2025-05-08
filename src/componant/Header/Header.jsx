import { useState } from "react";
import {Navbar, Container, Nav, Form, Button, InputGroup, Badge, NavDropdown} from "react-bootstrap";
import { FaSearch,  FaShoppingBag} from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import { FaThLarge } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { PiPhoneCall } from "react-icons/pi";
import { BiHeart, BiSearch, BiShoppingBag, BiUser } from "react-icons/bi";
function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header>
      {/* Bar */}
      <div className="bg-light text-secondary py-2">
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
          <div className="text-center">World's Fastest Online Shopping Destination</div>
          <div className="d-flex gap-3">
            <a href="#help" className="text-secondary text-decoration-none">
              Help?
            </a>
            <a href="#track-order" className="text-secondary text-decoration-none">
              Track Order
            </a>
            <NavDropdown title="English" id="language-dropdown" className="text-secondary">
              <NavDropdown.Item href="#english">English</NavDropdown.Item>
              <NavDropdown.Item href="#arabic">العربية</NavDropdown.Item>
              <NavDropdown.Item href="#french">Français</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Dollar" id="currency-dropdown" className="text-secondary">
              <NavDropdown.Item href="#usd">USD ($)</NavDropdown.Item>
              <NavDropdown.Item href="#eur">EUR (€)</NavDropdown.Item>
              <NavDropdown.Item href="#gbp">GBP (£)</NavDropdown.Item>
            </NavDropdown>
          </div>
        </Container>
      </div>

      {/* Main Header */}
      <div className="py-3 border-bottom">
        <Container className="d-flex justify-content-between align-items-center">
          {/* Logo */}
          <a href="/" className="text-decoration-none d-flex align-items-center">
            <img
              src="https://grabit-react-next.maraviyainfotech.com/assets/img/logo/logo.png"
              alt="Grabit Logo"
              style={{ height: "50px" }}
            />
          </a>
          
          {/* Search Bar */}
          <div className="flex-grow-1 mx-5">
            <InputGroup>
              <Form.Control
                placeholder="Search Products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-end-0"
              />
              <Button variant="outline-secondary" className="bg-white border-start-0">
                <BiSearch size={20} />
              </Button>
            </InputGroup>
          </div>

          {/* User Actions */}
          <div className="d-flex gap-4">
            <div className="d-flex flex-column align-items-center">
              <a href="/account" className="text-decoration-none text-secondary">
                <BiUser size={24} />
                <div className="small">Account</div>
                <div className="small fw-bold">LOGIN</div>
              </a>
            </div>

            <div className="d-flex flex-column align-items-center">
              <a href="/Wishlist" className="text-decoration-none text-secondary">
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

            <div className="d-flex flex-column align-items-center">
              <a href="/Cart" className="text-decoration-none text-secondary">
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

      {/* Navigation Menu */}
      <Navbar bg="light" expand="lg" className="py-0">
  <Container>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />

    <Dropdown>
  <Dropdown.Toggle
    style={{
      backgroundColor: "#5cac94",
      borderColor: "#5cac94",
    }}
    className="d-flex align-items-center gap-2 py-3 px-4 rounded-0"
  >
    <FaThLarge />
    All Categories
  </Dropdown.Toggle>

  <Dropdown.Menu>
    <Dropdown.Item href="#fruits">Fruits</Dropdown.Item>
    <Dropdown.Item href="#vegetables">Vegetables</Dropdown.Item>
    <Dropdown.Item href="#meat">Meat & Seafood</Dropdown.Item>
    <Dropdown.Item href="#drinks">Drinks</Dropdown.Item>
    <Dropdown.Item href="#snacks">Snacks</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>

    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="mx-auto">
        <NavDropdown title="Home" id="home-dropdown" className="px-3 py-3">
          <NavDropdown.Item href="#home1">Home 1</NavDropdown.Item>
          <NavDropdown.Item href="#home2">Home 2</NavDropdown.Item>
        </NavDropdown>

        <NavDropdown title="Categories" id="categories-dropdown" className="px-3 py-3">
          <NavDropdown.Item href="#fruits">Fruits</NavDropdown.Item>
          <NavDropdown.Item href="#vegetables">Vegetables</NavDropdown.Item>
          <NavDropdown.Item href="#meat">Meat & Seafood</NavDropdown.Item>
        </NavDropdown>

        <NavDropdown title="Blog" id="blog-dropdown" className="px-3 py-3">
          <NavDropdown.Item href="#blog-list">Blog List</NavDropdown.Item>
          <NavDropdown.Item href="#blog-details">Blog Details</NavDropdown.Item>
        </NavDropdown>

        <NavDropdown title="Pages" id="pages-dropdown" className="px-3 py-3">
          <NavDropdown.Item href="#about">About Us</NavDropdown.Item>
          <NavDropdown.Item href="#contact">Contact</NavDropdown.Item>
          <NavDropdown.Item href="#faq">FAQ</NavDropdown.Item>
        </NavDropdown>

        <Nav.Link href="#offers" className="px-3 py-3 d-flex align-items-center gap-2">
          <FaShoppingBag size={16} />
          Offers
        </Nav.Link>
      </Nav>
    </Navbar.Collapse>

    {/* <Button
      style={{ backgroundColor: "#5cac94", borderColor: "#5cac94" }}
      className="d-flex align-items-center gap-2 py-3 px-4 rounded-0"
    >
      <FaMapMarkerAlt size={18} />
      New York
    </Button> */}
  </Container>
</Navbar>

    </header>
  );
}

export default Header;
