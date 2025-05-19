import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { Container } from "react-bootstrap";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "./styles.css";

const HeroSlider = () => {
  const [isContentVisible, setIsContentVisible] = useState(true);

  const handleSlideChange = () => {
    setIsContentVisible(false);
    setTimeout(() => {
      setIsContentVisible(true);
    }, 1000);
  };

  return (
    <Container className="py-4">
      <div className="swiper swiper-pagination-white swiper-wrapper swiper-initialized swiper-horizontal gi-slider main-slider-nav main-slider-dot swiper-backface-hidden">
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
          speed={2000}
          loop={true}
          modules={[Autoplay, Pagination]}
          className="mySwiper"
          onSlideChange={handleSlideChange}
        >
          <SwiperSlide>
            <div className="gi-slide-item d-flex slide-1">
              <div
                className={`gi-slide-content ${
                  isContentVisible ? "visible" : "hidden"
                }`}
              >
                <p>
                  Starting at $ <b>20.00</b>
                </p>
                <h1 className="gi-slide-title">Organic & healthy vegetables</h1>
                <div className="gi-slide-btn">
                  <Link to="/shop" className="gi-btn-1">
                    Shop Now <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="gi-slide-item d-flex slide-2">
              <div
                className={`gi-slide-content ${
                  isContentVisible ? "visible" : "hidden"
                }`}
              >
                <p>
                  Starting at $ <b>29.99</b>
                </p>
                <h1 className="gi-slide-title">Explore fresh & juicy fruits</h1>
                <div className="gi-slide-btn">
                  <Link to="/shop" className="gi-btn-1">
                    Shop Now <FiArrowRight />
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
