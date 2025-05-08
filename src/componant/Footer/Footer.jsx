import { Container, Row, Col } from "react-bootstrap";
import {FaFacebookF,FaTwitter, FaInstagram,FaYoutube,FaMapMarkerAlt,FaPhone,FaEnvelope,FaClock,FaGooglePlay} from "react-icons/fa";


const Footer = () => {
  return (
    <div className="bg-white text-secondary py-5">
      <Container>
        <Row className="gy-4">
          {/* Logo & About */}
          <Col md={3}>
            <div className="mb-4">
              <img
                src="https://grabit-react-next.maraviyainfotech.com/assets/img/logo/logo.png"
                alt="Grabit Logo"
                style={{ height: "40px" }}
              />
            </div>
            <p>
              Grabit is the biggest marketof grocery.Get your daily needs from our site.
            </p>
          </Col>

          {/* Footer Columns */}
          {[
            {
              title: "Category",
              links: ["Dried Fruit", "Cookies", "Foods", "Fresh Fruit", "Tuber Root", "Vegetables"]
            },
            {
              title: "Company",
              links: ["About Us", "Delivery", "Legal Notice", "Terms & Conditions", "Secure Payment", "Contact Us"]
            },
            {
              title: "Account",
              links: ["Sign In", "View Cart", "Return Policy", "Become a Vendor", "Affiliate Program", "Payment"]
            }
          ].map((section, index) => (
            <Col md={2} key={index}>
              <h5 className="mb-3 pb-2 border-bottom fw-bold">{section.title}</h5>
              <ul className="list-unstyled">
                {section.links.map((link, i) => (
                  <li key={i} className="mb-2">
                    <a href="#" className="text-secondary text-decoration-none hover-green">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </Col>
          ))}

          {/* Contact Info */}
          <Col md={2}>
            <h5 className="mb-3 pb-2 border-bottom fw-bold">Contact Info</h5>
            <ul className="list-unstyled">
              <li className="d-flex gap-3 mb-3">
                <FaMapMarkerAlt className="text-success" />
                <span>123 Street, New York, USA</span>
              </li>
              <li className="d-flex gap-3 mb-3">
                <FaPhone className="text-success" />
                <span>+20 10322 70 55</span>
              </li>
              <li className="d-flex gap-3 mb-3">
                <FaEnvelope className="text-success" />
                <span>info@grabit.com</span>
              </li>
              
            </ul>
            <div className="d-flex gap-2 mt-3">
              {[FaFacebookF, FaTwitter, FaInstagram, FaYoutube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="text-white bg-secondary p-2 rounded-circle hover-green"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Hover styling */}
      <style>
        {`
          .hover-green:hover {
            color: #5cac94!important;
            // background-color: #e6f8ec !important;
          }
        `}
      </style>
    </div>
  );
};

export default Footer;
