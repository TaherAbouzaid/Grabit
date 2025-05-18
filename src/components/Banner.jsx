import React from "react";
import { Container } from "react-bootstrap";
import "./styles.css";
import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <Container className="py-4">
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
            <div className="gi-bnr-info">
              <h2>Fresh Fruits <br /> Healthy Products</h2>
              <h3>30% off sale <span>Hurry up!!!</span></h3>
              

<Link className="gi-btn-2" to="/shop">Shop now</Link>
        
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
};

export default Banner;
