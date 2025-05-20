import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './styles.css';

const TwoBanners = () => {
  return (
    <Container className="py-4" style={{"overflow": "hidden"}}>
      <Row>
        <Col md={6} data-aos="slide-right" data-aos-duration="3000" >
          <div className="dual-banner-wrapper">
            <div className="dual-banner-item">
              <div className="dual-banner-img">
                <span className="dual-discount-label">70% Off</span>
                <img alt="banner" src="https://grabit-react-next.maraviyainfotech.com/assets/img/banner/2.jpg" />
              </div>
              <div className="dual-banner-content">
                <h5>Tasty Snack & Fastfood</h5>
                <p>The flavor of something special</p>
                <a href="/shop-left-sidebar-col-3" className="dual-shop-btn">Shop Now</a>
              </div>
            </div>
          </div>
        </Col>
        <Col md={6} data-aos="slide-left" data-aos-duration="3000" >
          <div className="dual-banner-wrapper m-t-767">
            <div className="dual-banner-item">
              <div className="dual-banner-img">
                <span className="dual-discount-label">50% Off</span>
                <img alt="banner" src="https://grabit-react-next.maraviyainfotech.com/assets/img/banner/3.jpg" />
              </div>
              <div className="dual-banner-content">
                <h5>Fresh Fruits & veggies</h5>
                <p>A healthy meal for every one</p>
                <a className="dual-shop-btn" href="/shop-left-sidebar-col-3/">Shop Now</a>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TwoBanners;
