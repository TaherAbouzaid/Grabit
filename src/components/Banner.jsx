import React from "react";
import { Container } from "react-bootstrap";
import "./styles.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

const Banner = () => {
  useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <Container className="py-5">
      <section
        className="gi-banner padding-tb-40 wow fadeInUp"
        data-wow-duration="2s"
        style={{
          backgroundImage: "url('/images/banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "5px",
        }}
      >
        <div
          className="gi-animated-banner"
          data-aos="fade-up"
          data-aos-duration="2000"
          data-aos-delay="200"
        >
          {/* <h2 className="d-none">Offers</h2> */}
          <div className="gi-bnr-detail">
            <div className={`gi-bnr-info ${currentLanguage === 'ar' ? 'text-right' : ''}`}>
              <h2>
                {currentLanguage === 'ar' 
                  ? 'فواكه طازجة \n منتجات صحية' 
                  : 'Fresh Fruits \n Healthy Products'}
              </h2>
              <h3>
                {currentLanguage === 'ar' 
                  ? 'خصم 30٪ ' 
                  : '30% off sale '}
                <span>
                  {currentLanguage === 'ar' 
                    ? 'أسرع!!!' 
                    : 'Hurry up!!!'}
                </span>
              </h3>

              <Link className="gi-btn-2" to="/shop">
                {currentLanguage === 'ar' ? 'تسوق الآن' : 'Shop now'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
};

export default Banner;
