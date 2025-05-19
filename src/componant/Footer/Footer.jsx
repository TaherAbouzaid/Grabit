import { Container, Row, Col } from "react-bootstrap";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import { BiLocationPlus, BiPhone, BiEnvelope } from "react-icons/bi";
import { useSelector, useDispatch } from "react-redux";
import { setCategory, setSubcategory } from "../../Store/Slices/filtersSlice";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./Footer.css";

const Footer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products } = useSelector((state) => state.products);
  const { t } = useTranslation();

  // Extract categories dynamically from products
  const categories = useMemo(() => {
    const filteredProducts = products.filter((p) => {
      if (!p.categoryId || !p.categoryId.categoryId) {
        console.log("Product missing categoryId:", p);
        return false;
      }
      return true;
    });
    const categoriesMap = new Map(
      filteredProducts.map((p) => [
        p.categoryId.categoryId,
        {
          id: p.categoryId.categoryId,
          name: p.categoryId.name?.en || t("categories.uncategorized", "Uncategorized"),
        },
      ])
    );
    return Array.from(categoriesMap.values());
  }, [products, t]);

  const handleCategoryClick = (categoryId) => {
    console.log("Category clicked in Footer:", { categoryId });
    dispatch(setCategory(categoryId));
    dispatch(setSubcategory(null));
    navigate("/shop");
  };

  return (
    <footer>
      <Container>
        <Row className="gy-4 gx-2">
          {/* Logo */}
          <Col xs={12} sm={6} md={4} lg={3}>
            <img
              src="https://grabit-react-next.maraviyainfotech.com/assets/img/logo/logo.png"
              alt="Grabit Logo"
              className="logo mb-3"
            />
            <p className="mb-3">
              Grabit is the biggest market of grocery products. Get your daily
              needs from our store.
            </p>
            <div className="app-store-buttons">
              <a href="#" rel="noopener noreferrer">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/app/android.png"
                  alt="Google Play"
                  className="app-store-img"
                />
              </a>
              <a href="#" rel="noopener noreferrer">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/app/apple.png"
                  alt="App Store"
                  className="app-store-img"
                />
              </a>
            </div>
          </Col>

          {/* Category */}
          <Col xs={6} sm={4} md={3} lg={2}>
            <h6 className="footer-title">Category</h6>
            {products.length === 0 ? (
              <div>Loading...</div>
            ) : categories.length === 0 ? (
              <div>No categories available</div>
            ) : (
              <ul className="footer-list">
                {categories.map((category) => (
                  <li key={category.id}>
                    <a
                      href="#"
                      className="footer-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCategoryClick(category.id);
                      }}
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Col>

          {/* Company */}
          <Col xs={6} sm={4} md={3} lg={2}>
            <h6 className="footer-title">Company</h6>
            <ul className="footer-list">
              <li><a href="/AboutUs" className="footer-link">About us</a></li>
              <li><a href="/OrderTracker" className="footer-link">Delivery</a></li>
              <li><a href="#" className="footer-link">Legal Notice</a></li>
              <li><a href="#" className="footer-link">Terms & conditions</a></li>
              <li><a href="/Checkout" className="footer-link">Secure payment</a></li>
              <li><a href="/ContactPage" className="footer-link">Contact us</a></li>
            </ul>
          </Col>

          {/* Account */}
          <Col xs={6} sm={4} md={3} lg={2}>
            <h6 className="footer-title">Account</h6>
            <ul className="footer-list">
              <li><a href="/Register" className="footer-link">Sign In</a></li>
              <li><a href="/Cart" className="footer-link">View Cart</a></li>
              <li><a href="#" className="footer-link">Return Policy</a></li>
              <li><a href="#" className="footer-link">Become a Vendor</a></li>
              <li><a href="#" className="footer-link">Affiliate Program</a></li>
              <li><a href="Checkout" className="footer-link">Payments</a></li>
            </ul>
          </Col>

          {/* Contact */}
          <Col xs={12} sm={6} md={4} lg={3}>
            <h6 className="footer-title">Contact</h6>
            <ul className="list-unstyled">
              <li className="d-flex gap-2 align-items-start mb-3">
                <BiLocationPlus color="#5cac94" size={28} />
                <span className="contact-text">
                  2548 Broaddus Maple Court, Madisonville KY 4783, USA.
                </span>
              </li>
              <li className="d-flex gap-2 align-items-center mb-3">
                <BiPhone color="#5cac94" size={18} />
                <span className="contact-text">+00 9876543210</span>
              </li>
              <li className="d-flex gap-2 align-items-center mb-3">
                <BiEnvelope color="#5cac94" size={18} />
                <span className="contact-text">example@email.com</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="d-flex gap-2 justify-content-center justify-content-md-start mt-2">
              {[
                { Icon: FaFacebookF, label: "Facebook" },
                { Icon: FaLinkedinIn, label: "LinkedIn" },
                { Icon: FaTwitter, label: "Twitter" },
                { Icon: FaInstagram, label: "Instagram" },
              ].map(({ Icon, label }, idx) => (
                <a
                  key={idx}
                  href="#top"
                  className="social-icon"
                  aria-label={`Follow us on ${label}`}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </Col>
        </Row>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="mb-2 mb-md-0 text-center text-md-start">
            © Grabit. All rights reserved. Powered by Grabit.
          </p>
          <div className="footer-payment d-flex gap-2 justify-content-center">
            <img
              src="https://grabit-react-next.maraviyainfotech.com/assets/img/hero-bg/payment.png"
              alt="Payment Methods"
            />
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;