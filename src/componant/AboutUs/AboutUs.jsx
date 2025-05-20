import { Container, Row, Col } from "react-bootstrap";
import { Truck, Headset, RotateCcw, Shield } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AboutUs.css";
import "../../components/styles.css";
import { useTranslation } from "react-i18next";

export default function AboutUs() {
  const { t, i18n } = useTranslation();


  document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";

  
  const teamImages = [
    "https://grabit-react-next.maraviyainfotech.com/assets/img/team/team-4.jpg",
    "https://grabit-react-next.maraviyainfotech.com/assets/img/team/team-5.jpg",
    "acount user.jpeg",
    "https://grabit-react-next.maraviyainfotech.com/assets/img/team/team-1.jpg",
    "https://grabit-react-next.maraviyainfotech.com/assets/img/team/team-2.jpg",
  ];

  return (
    <>
      <Container className="my-5">
        <Row className="align-items-start">
         
          <Col md={4} lg={3} className="image-column">
            <div className="image-grid">
              <div className="image-container mb-4">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/about-2.png"
                  alt={t("aboutUs.title")}
                  className="img-fluid rounded shadow small-image"
                />
              </div>
              <div className="image-container">
                <img
                  src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/about-3.png"
                  alt={t("aboutUs.title")}
                  className="img-fluid rounded shadow small-image"
                />
              </div>
            </div>
          </Col>
          
          <Col md={8} lg={9}>
            <Row className="align-items-start gx-1">
              <Col md={12} lg={6}>
                <div className="image-container mb-4">
                  <img
                    src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/about.png"
                    alt={t("aboutUs.title")}
                    className="img-fluid rounded shadow main-image"
                  />
                </div>
              </Col>
              <Col md={12} lg={6} className="content-column">
                <div className="content-section">
                  <h2 className="section-title">
                    {t("aboutUs.title")}{" "}
                    <span className="text-success same-size">{t("aboutUs.titleHighlight")}</span>
                  </h2>
                  <h4 className="section-subtitle mb-4">{t("aboutUs.subtitle")}</h4>
                  <p className="section-text">{t("aboutUs.text1")}</p>
                  <p className="section-text">{t("aboutUs.text2")}</p>
                  <p className="section-text">{t("aboutUs.text3")}</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Services Section */}
      <Container className="my-5 services-section">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="section-title">
              {t("services.title")}{" "}
              {/* <span className="text-success same-size">{t("services.titleHighlight")}</span> */}
            </h2>
            <p className="section-subtitle">{t("services.subtitle")}</p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={3} sm={6} className="mb-4">
            <div className="service-card text-center p-4">
              <div className="icon-container mb-3">
                <Truck className="service-icon" />
              </div>
              <h4 className="service-title">{t("services.freeShipping.title")}</h4>
              <p className="service-text">{t("services.freeShipping.text")}</p>
            </div>
          </Col>

          <Col md={3} sm={6} className="mb-4">
            <div className="service-card text-center p-4">
              <div className="icon-container mb-3">
                <Headset className="service-icon" />
              </div>
              <h4 className="service-title">{t("services.support.title")}</h4>
              <p className="service-text">{t("services.support.text")}</p>
            </div>
          </Col>

          <Col md={3} sm={6} className="mb-4">
            <div className="service-card text-center p-4">
              <div className="icon-container mb-3">
                <RotateCcw className="service-icon" />
              </div>
              <h4 className="service-title">{t("services.returns.title")}</h4>
              <p className="service-text">{t("services.returns.text")}</p>
            </div>
          </Col>

          <Col md={3} sm={6} className="mb-4">
            <div className="service-card text-center p-4">
              <div className="icon-container mb-3">
                <Shield className="service-icon" />
              </div>
              <h4 className="service-title">{t("services.payment.title")}</h4>
              <p className="service-text">{t("services.payment.text")}</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Team Section */}
      <Container className="my-5 team-section">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="section-title">
              {/* {t("team.title")}{" "} */}
              <span className="text-success same-size">{t("team.titleHighlight")}</span>
            </h2>
            <p className="section-subtitle">{t("team.subtitle")}</p>
          </Col>
        </Row>

        <div className="team-slider-wrapper">
          <div className="team-slider">
            {t("team.members", { returnObjects: true }).map((member, index) => (
              <div className="team-card" key={index}>
                <div className="team-image-container mb-3">
                  <img
                    src={teamImages[index % teamImages.length]}
                    alt={member.name}
                    className="img-fluid rounded team-image"
                  />
                </div>
                <h4 className="team-name">{member.name}</h4>
                <p className="team-position">{member.position}</p>
              </div>
            ))}
            
            {t("team.members", { returnObjects: true }).map((member, index) => (
              <div className="team-card" key={`duplicate-${index}`}>
                <div className="team-image-container mb-3">
                  <img
                    src={teamImages[index % teamImages.length]}
                    alt={member.name}
                    className="img-fluid rounded team-image"
                  />
                </div>
                <h4 className="team-name">{member.name}</h4>
                <p className="team-position">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}