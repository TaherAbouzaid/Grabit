import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import TrendingItems from "./TrendingItems";
import TopRatedItems from "./TopRatedItems";
import TopSellingItems from "./TopSellingItems";
import "./styles.css";

const ProductsShowcaseSection = () => {
  const isLargeScreen = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;

  return (
    <div >
      <Container className="products-showcase-section py-4">
        <Row className="g-4 align-items-stretch" style={{ minHeight: '350px' }}>
          <Col xl={3} lg={6} md={6} sm={12} xs={12} className="fadeup-feature d-flex align-items-stretch" style={{ animationDelay: '1s', height: '100%', minHeight: isLargeScreen ? '390px' : undefined }}>
            <div className="showcase-image-content h-100 d-flex flex-column" style={{ height: '100%' }}>
              <div className="position-relative h-100" style={{ height: '100%' }}>
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/banner/4.jpg"
                  alt="Showcase"
                  className="showcase-main-img w-100 h-100"
                  style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                />
                <div className="showcase-content-box">
                  <h3 className="showcase-title mb-3">Our Top Most Products Check It Now</h3>
                  <Button variant="success" className="showcase-btn">Shop Now</Button>
                </div>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={6} md={6} sm={12} xs={12} className="fadeup-feature d-flex align-items-stretch" style={{ animationDelay: '2s', height: '100%', minHeight: isLargeScreen ? '370px' : undefined }}><div style={{height:'100%', width:'100%'}}><TrendingItems /></div></Col>
          <Col xl={3} lg={6} md={6} sm={12} xs={12} className="fadeup-feature d-flex align-items-stretch" style={{ animationDelay: '3s', height: '100%', minHeight: isLargeScreen ? '370px' : undefined }}><div style={{height:'100%', width:'100%'}}><TopRatedItems /></div></Col>
          <Col xl={3} lg={6} md={6} sm={12} xs={12} className="fadeup-feature d-flex align-items-stretch" style={{ animationDelay: '4s', height: '100%', minHeight: isLargeScreen ? '370px' : undefined }}><div style={{height:'100%', width:'100%'}}><TopSellingItems /></div></Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProductsShowcaseSection; 