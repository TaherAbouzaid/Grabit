/* eslint-disable no-unused-vars */
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
  const { t, i18n } = useTranslation();

  // Extract categories dynamically from products
  const categories = useMemo(() => {
    const filteredProducts = products.filter((p) => {
      if (!p.categoryId || !p.categoryId.categoryId) {
        return false;
      }
      return true;
    });
    const categoriesMap = new Map(
      filteredProducts.map((p) => [
        p.categoryId.categoryId,
        {
          id: p.categoryId.categoryId,
          name: p.categoryId.name?.[i18n.language] || t("categories.uncategorized", "Uncategorized"),
        },
      ])
    );
    return Array.from(categoriesMap.values());
  }, [products, t, i18n.language]);

  const handleCategoryClick = (categoryId) => {
    dispatch(setCategory(categoryId));
    dispatch(setSubcategory(null));
    navigate("/shop");
  };

  return (
    <footer dir={i18n.dir()}>
      <Container>
        <Row className="gy-4 gx-2">
          {/* Logo Section */}
          <Col xs={12} sm={6} md={4} lg={3}>
            <img
              src="https://grabit-react-next.maraviyainfotech.com/assets/img/logo/logo.png"
              alt="Grabit Logo"
              className="logo mb-3"
            />
            <p className="mb-3">{t("footer.description")}</p>
            <div className="app-store-buttons">
              <a href="#" rel="noopener noreferrer">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/app/android.png"
                  alt={t("footer.googlePlayAlt")}
                  className="app-store-img"
                />
              </a>
              <a href="#" rel="noopener noreferrer">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/app/apple.png"
                  alt={t("footer.appStoreAlt")}
                  className="app-store-img"
                />
              </a>
            </div>
          </Col>

          {/* Category Section */}
          <Col xs={6} sm={4} md={3} lg={2}>
            <h6 className="footer-title">{t("footer.category")}</h6>
            {products.length === 0 ? (
              <div>{t("common.loading")}</div>
            ) : categories.length === 0 ? (
              <div>{t("categories.no_categories", "No categories available")}</div>
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

          {/* Company Section */}
          <Col xs={6} sm={4} md={3} lg={2}>
            <h6 className="footer-title">{t("footer.company")}</h6>
            <ul className="footer-list">
              <li><a href="/AboutUs" className="footer-link">{t("footer.companyLinks.aboutUs")}</a></li>
              <li><a href="/OrderTracker" className="footer-link">{t("footer.companyLinks.delivery")}</a></li>
              <li><a href="#" className="footer-link">{t("footer.companyLinks.legalNotice")}</a></li>
              <li><a href="#" className="footer-link">{t("footer.companyLinks.termsConditions")}</a></li>
              <li><a href="/Checkout" className="footer-link">{t("footer.companyLinks.securePayment")}</a></li>
              <li><a href="/ContactPage" className="footer-link">{t("footer.companyLinks.contactUs")}</a></li>
            </ul>
          </Col>

          {/* Account Section */}
          <Col xs={6} sm={4} md={3} lg={2}>
            <h6 className="footer-title">{t("footer.account")}</h6>
            <ul className="footer-list">
              <li><a href="/Register" className="footer-link">{t("footer.accountLinks.signIn")}</a></li>
              <li><a href="/Cart" className="footer-link">{t("footer.accountLinks.viewCart")}</a></li>
              <li><a href="#" className="footer-link">{t("footer.accountLinks.returnPolicy")}</a></li>
              <li><a href="#" className="footer-link">{t("footer.accountLinks.becomeVendor")}</a></li>
              <li><a href="#" className="footer-link">{t("footer.accountLinks.affiliateProgram")}</a></li>
              <li><a href="/Checkout" className="footer-link">{t("footer.accountLinks.payments")}</a></li>
            </ul>
          </Col>

          {/* Contact Section */}
          <Col xs={12} sm={6} md={4} lg={3}>
            <h6 className="footer-title">{t("footer.contact")}</h6>
            <ul className="list-unstyled">
              <li className="d-flex gap-2 align-items-start mb-3">
                <BiLocationPlus color="#5cac94" size={28} />
                <span className="contact-text">{t("footer.contactInfo.address")}</span>
              </li>
              <li className="d-flex gap-2 align-items-center mb-3">
                <BiPhone color="#5cac94" size={18} />
                <span className="contact-text">{t("footer.contactInfo.phone")}</span>
              </li>
              <li className="d-flex gap-2 align-items-center mb-3">
                <BiEnvelope color="#5cac94" size={18} />
                <span className="contact-text">{t("footer.contactInfo.email")}</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="d-flex gap-2 justify-content-center justify-content-md-start mt-2">
              {[
                { Icon: FaFacebookF, label: t("footer.social.facebook") },
                { Icon: FaLinkedinIn, label: t("footer.social.linkedin") },
                { Icon: FaTwitter, label: t("footer.social.twitter") },
                { Icon: FaInstagram, label: t("footer.social.instagram") },
              ].map(({ Icon, label }, idx) => (
                <a
                  key={idx}
                  href="#top"
                  className="social-icon"
                  aria-label={label}
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
            {t("footer.copyright")}
          </p>
          <div className="footer-payment d-flex gap-2 justify-content-center">
            <img
              src="https://grabit-react-next.maraviyainfotech.com/assets/img/hero-bg/payment.png"
              alt={t("footer.paymentMethodsAlt")}
            />
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;