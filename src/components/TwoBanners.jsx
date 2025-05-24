import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './styles.css';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const TwoBanners = () => {
  const { currentLanguage } = useLanguage();
   useTranslation();
  const navigate = useNavigate();
  
  return (
    <Container className="py-4" style={{ overflow: "hidden" }}>
      <Row>
        <Col md={6} data-aos="slide-right" data-aos-duration="3000">
          <div className="dual-banner-wrapper">
            <div className="dual-banner-item">
              <div className="dual-banner-img">
                <span className="dual-discount-label">
                  {currentLanguage === "ar" ? "خصم ٢٠٪" : "70% Off"}
                </span>
                <img
                  alt="banner"
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/banner/2.jpg"
                />
              </div>
              <div className="dual-banner-content">
                <h5>
                  {currentLanguage === "ar"
                    ? "وجبات خفيفة ووجبات سريعة لذيذة"
                    : "Tasty Snack & Fastfood"}
                </h5>
                <p>
                  {currentLanguage === "ar"
                    ? "نكهة شيء مميز"
                    : "The flavor of something special"}
                </p>
                <a
                  onClick={() => navigate("/shop")}
                  style={{ cursor: "pointer" }}
                  className="dual-shop-btn "
                >
                  {currentLanguage === "ar" ? "تسوق الآن" : "Shop Now"}
                </a>
              </div>
            </div>
          </div>
        </Col>
        <Col md={6} data-aos="slide-left" data-aos-duration="3000">
          <div className="dual-banner-wrapper m-t-767">
            <div className="dual-banner-item">
              <div className="dual-banner-img">
                <span className="dual-discount-label">
                  {currentLanguage === "ar" ? "خصم ٢٠٪" : "50% Off"}
                </span>
                <img
                  alt="banner"
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/banner/3.jpg"
                />
              </div>
              <div className="dual-banner-content">
                <h5>
                  {currentLanguage === "ar"
                    ? "فواكه وخضروات طازجة"
                    : "Fresh Fruits & veggies"}
                </h5>
                <p>
                  {currentLanguage === "ar"
                    ? "وجبة صحية للجميع"
                    : "A healthy meal for every one"}
                </p>
                <a
                  style={{ cursor: "pointer" }}
                  className="dual-shop-btn"
                  onClick={() => navigate("/shop")}
                >
                  {currentLanguage === "ar" ? "تسوق الآن" : "Shop Now"}
                </a>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TwoBanners;
