import { Container, Row, Col } from "react-bootstrap";
import { Truck, Headset, RotateCcw, Shield } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AboutUs.css";

export default function AboutUs() {
  return (
    <>
      <Container className="my-5">
        <Row className="align-items-start">
          <Col md={6} className="image-column">
            <div className="image-grid">
              {/* Main large image */}
              <div className="image-container mb-4">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/about.png"
                  alt="Store interior"
                  className="img-fluid rounded shadow main-image"
                />
              </div>
              {/* Smaller images in a row */}
              <Row className="smaller-images g-3">
                <Col xs={6} md={6}>
                  <div className="image-container">
                    <img
                      src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/about-2.png"
                      alt="Farmer harvesting tomatoes"
                      className="img-fluid rounded shadow"
                    />
                  </div>
                </Col>
                <Col xs={6} md={6}>
                  <div className="image-container">
                    <img
                      src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/about-3.png"
                      alt="Greenhouse with plants"
                      className="img-fluid rounded shadow"
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
          <Col md={6}>
            <div className="content-section">
              <h2 className="section-title">
                Who We <span className="text-success same-size">Are?</span>
              </h2>
              <h4 className="section-subtitle mb-4">
                WE'RE HERE TO SERVE ONLY THE BEST PRODUCTS FOR YOU. ENRICHING YOUR HOMES WITH THE BEST ESSENTIALS.
              </h4>
              <p className="section-text">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make a type specimen book.
              </p>
              <p className="section-text">
                It has survived not only five centuries, but also the leap into electronic typesetting, remaining
                essentially unchanged. Lorem Ipsum has survived not only five centuries, but also the leap into
                electronic typesetting, remaining essentially unchanged.
              </p>
              <p className="section-text">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make a type specimen book.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Services Section */}
      <Container className="my-5 services-section">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="section-title">
              Our <span className="text-success same-size">Services</span>
            </h2>
            <p className="section-subtitle">
              Customer service should not be a department. It
              <br />
              should be the entire company.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={3} sm={6} className="mb-4">
            <div className="service-card text-center p-4">
              <div className="icon-container mb-3">
                <Truck className="service-icon" />
              </div>
              <h4 className="service-title">Free Shipping</h4>
              <p className="service-text">Free shipping on all US order or order above $200</p>
            </div>
          </Col>

          <Col md={3} sm={6} className="mb-4">
            <div className="service-card text-center p-4">
              <div className="icon-container mb-3">
                <Headset className="service-icon" />
              </div>
              <h4 className="service-title">24x7 Support</h4>
              <p className="service-text">Contact us 24 hours a day, 7 days a week</p>
            </div>
          </Col>

          <Col md={3} sm={6} className="mb-4">
            <div className="service-card text-center p-4">
              <div className="icon-container mb-3">
                <RotateCcw className="service-icon" />
              </div>
              <h4 className="service-title">30 Days Return</h4>
              <p className="service-text">Simply return it within 30 days for an exchange</p>
            </div>
          </Col>

          <Col md={3} sm={6} className="mb-4">
            <div className="service-card text-center p-4">
              <div className="icon-container mb-3">
                <Shield className="service-icon" />
              </div>
              <h4 className="service-title">Payment Secure</h4>
              <p className="service-text">Contact us 24 hours a day, 7 days a week</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Team Section */}
      <Container className="my-5 team-section">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="section-title">
              Our <span className="text-success same-size">Team</span>
            </h2>
            <p className="section-subtitle">Meet our expert team members.</p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={2} md={4} sm={6} className="mb-4">
            <div className="team-card text-center">
              <div className="team-image-container mb-3">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/team/team-4.jpg"
                  alt="Olivia Smith"
                  className="img-fluid rounded team-image"
                />
              </div>
              <h4 className="team-name">Ahmed</h4>
              <p className="team-position">Manager</p>
            </div>
          </Col>

          <Col lg={2} md={4} sm={6} className="mb-4">
            <div className="team-card text-center">
              <div className="team-image-container mb-3">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/team/team-5.jpg"
                  alt="William Dalin"
                  className="img-fluid rounded team-image"
                />
              </div>
              <h4 className="team-name">mohamed</h4>
              <p className="team-position">Manager</p>
            </div>
          </Col>

          <Col lg={2} md={4} sm={6} className="mb-4">
            <div className="team-card text-center">
              <div className="team-image-container mb-3">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/team/team-3.jpg"
                  alt="Emma Welson"
                  className="img-fluid rounded team-image"
                />
              </div>
              <h4 className="team-name">Taher</h4>
              <p className="team-position">Leader</p>
            </div>
          </Col>

          <Col lg={2} md={4} sm={6} className="mb-4">
            <div className="team-card text-center">
              <div className="team-image-container mb-3">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/team/team-1.jpg"
                  alt="Benjamin Martin"
                  className="img-fluid rounded team-image"
                />
              </div>
              <h4 className="team-name">Lujain</h4>
              <p className="team-position">Manager</p>
            </div>
          </Col>

          <Col lg={2} md={4} sm={6} className="mb-4">
            <div className="team-card text-center">
              <div className="team-image-container mb-3">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/team/team-2.jpg"
                  alt="Amelia Martin"
                  className="img-fluid rounded team-image"
                />
              </div>
              <h4 className="team-name">Nour</h4>
              <p className="team-position">Manager</p>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}