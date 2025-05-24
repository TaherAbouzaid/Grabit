import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Container } from "react-bootstrap";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/pagination";
import "./styles.css";

const HeroSlider = () => {
  const { t } = useTranslation();
  const [isContentVisible, setIsContentVisible] = useState(true);
  const swiperRef = useRef(null);

  // تحديث Swiper عند التحميل الأولي
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.update();
    }
  }, []);

  const handleSlideChange = () => {
    setIsContentVisible(false);
    setTimeout(() => {
      setIsContentVisible(true);
    }, 1000); // تقليل التوقيت لتجنب التأخير
  };

  return (
    <Container className="py-4 gi-banner">
      <div
        className="swiper swiper-pagination-white swiper-wrapper swiper-initialized swiper-horizontal gi-slider main-slider-nav main-slider-dot swiper-backface-hidden"
        dir="ltr" // اتجاه ثابت LTR
      >
        <Swiper
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            waitForTransition: true,
          }}
          speed={2000} // تقليل السرعة لتحسين الأداء
          loop={true}
          slidesPerView={1}
          modules={[Autoplay, Pagination]}
          className="mySwiper"
          onSlideChange={handleSlideChange}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          dir="ltr" // اتجاه ثابت لـ Swiper
        >
          <SwiperSlide>
            <div className="gi-slide-item d-flex slide-1 gi-animated-banner">
              <div
                className={`gi-bnr-detail ${
                  isContentVisible ? "visible" : "hidden"
                }`}
              >
                <p style={{ fontSize: "2rem" }} className="gi-slide-content">
                  {t("slide1.price", { price: "20.00" })}
                </p>
                <h2 className="gi-slide-title">{t("slide1.title")}</h2>
                <div className="gi-slide-btn">
                  <Link to="/shop" className="gi-btn-2">
                    {t("slide1.button")} <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="gi-slide-item d-flex slide-2 gi-animated-banner">
              <div
                className={`gi-bnr-detail ${
                  isContentVisible ? "visible" : "hidden"
                }`}
              >
                <p style={{ fontSize: "2rem" }}>
                  {t("slide2.price", { price: "29.99" })}
                </p>
                <h2 className="gi-slide-title">{t("slide2.title")}</h2>
                <div className="gi-slide-btn">
                  <Link to="/shop" className="gi-btn-2">
                    {t("slide2.button")} <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </Container>
  );
};

export default HeroSlider;
