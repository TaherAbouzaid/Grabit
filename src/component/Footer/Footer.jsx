import { Container, Row, Col } from "react-bootstrap";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, } from "react-icons/fa";
import { BiLocationPlus, BiPhone, BiEnvelope } from "react-icons/bi";
import "../Footer/Footer.css"; // Import your CSS file for styling
const Footer = () => {
  return (
    <footer className="bg-white text-secondary pt-5 border-top">
      <Container>
        <Row className="gy-4">
          {/* Logo */}
          <Col md={3}>
            <img
              src="https://grabit-react-next.maraviyainfotech.com/assets/img/logo/logo.png"
              alt="Grabit Logo"
              style={{ height: 40 }}
              className="mb-3"
            />
            <p>
              Grabit is the biggest market of grocery products. Get your daily
              needs from our store.
            </p>
            <div className="d-flex gap-2">
              <a href="#" rel="noopener noreferrer">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/app/android.png"
                  alt="Google Play"
                  style={{ height: 36 }}
                />
              </a>
              <a href="#" rel="noopener noreferrer">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/app/apple.png"
                  alt="App Store"
                  style={{ height: 36 }}
                />
              </a>
            </div>

          </Col>

          {/* Category / Company / Account */}
          <Col md={2}>
            <h6 className="footer-title">Category</h6>
            <ul className="footer-list">
              <li><a href="#" className="footer-link">Dried Fruit</a></li>
              <li><a href="#" className="footer-link">Cookies</a></li>
              <li><a href="#" className="footer-link">Foods</a></li>
              <li><a href="#" className="footer-link">Fresh Fruit</a></li>
              <li><a href="#" className="footer-link">Tuber Root</a></li>
              <li><a href="#" className="footer-link">Vegetables</a></li>
            </ul>
          </Col>

          <Col md={2}>
            <h6 className="footer-title">Company</h6>
            <ul className="footer-list">
              <li><a href="#" className="footer-link">About us</a></li>
              <li><a href="#" className="footer-link">Delivery</a></li>
              <li><a href="#" className="footer-link">Legal Notice</a></li>
              <li><a href="#" className="footer-link">Terms & conditions</a></li>
              <li><a href="#" className="footer-link">Secure payment</a></li>
              <li><a href="#" className="footer-link">Contact us</a></li>
            </ul>
          </Col>

          <Col md={2}>
            <h6 className="footer-title">Account</h6>
            <ul className="footer-list">
              <li><a href="#" className="footer-link">Sign In</a></li>
              <li><a href="#" className="footer-link">View Cart</a></li>
              <li><a href="#" className="footer-link">Return Policy</a></li>
              <li><a href="#" className="footer-link">Become a Vendor</a></li>
              <li><a href="#" className="footer-link">Affiliate Program</a></li>
              <li><a href="#" className="footer-link">Payments</a></li>
            </ul>
          </Col>


          {/* Contact */}
          <Col md={3}>
            <h6 className="fw-bold mb-3 border-bottom pb-2">Contact</h6>
            <ul className="list-unstyled">
              <li className="d-flex gap-2 align-items-start mb-3">
                <BiLocationPlus color="#5cac94" size={30} />
                <span>2548 Broaddus Maple Court, Madisonville KY 4783, USA.</span>
              </li>
              <li className="d-flex gap-2 align-items-center mb-3">
                <BiPhone color="#5cac94" size={20} />
                <span>+00 9876543210</span>
              </li>
              <li className="d-flex gap-2 align-items-center mb-3">
                <BiEnvelope color="#5cac94" size={20} />
                <span>example@email.com</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="d-flex gap-2 mt-2">
              {[FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram].map(
                (Icon, idx) => (
                  <a
                    key={idx}
                    href="#top"
                    className="social-icon"
                  >
                    <Icon size={15} color="#fff" />
                  </a>
                )
              )}
            </div>
          </Col>
        </Row>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="mb-2 mb-md-0">
            Copyright © Grabit all rights reserved.
            Powered by Grabit.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <img
              src="https://grabit-react-next.maraviyainfotech.com/assets/img/hero-bg/payment.png"
              alt="Visa"
              style={{ height: 24 }}
            />
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
