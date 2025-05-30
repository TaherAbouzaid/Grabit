import { Container, Row, Col } from "react-bootstrap";
import { Truck, Headset, RotateCcw, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AboutUs.css";

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
      {/* About Section */}
      <Container >
        <Container>
          <Row className="align-items-center mb-5">
            <Col lg={6}>
              <div className="about-images-layout">
                <div className="left-large-img">
                  <img
                    src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/about.png"
                    alt="Main"
                  />
                </div>
                <div className="right-small-imgs">
                  <img
                    src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/about-2.png"
                    alt="Small 1"
                  />
                  <img
                    src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/about-3.png"
                    alt="Small 2"
                  />
                </div>
              </div>
            </Col>
            <Col lg={6}>
              {/* <h2 className="section-title">
                {t("aboutUs.title")}{" "}
                <span className="text-success">{t("aboutUs.titleHighlight")}</span>
              </h2> */}
                       <h2 className="section-title">
  <span style={{ fontWeight: "normal", fontSize: "inherit" }}>{t("aboutUs.title")}</span>{" "}
  <span className="text-black" style={{ fontSize: "inherit" }}>{t("aboutUs.titleHighlight")}</span>
</h2>
              <h5 className="text-muted mb-4">{t("aboutUs.subtitle")}</h5>
              <p className="section-text">{t("aboutUs.text1")}</p>
              <p className="section-text">{t("aboutUs.text2")}</p>
              <p className="section-text">{t("aboutUs.text3")}</p>
              {/* <img
                src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/about.png"
                alt="about-main"
                className="img-fluid rounded shadow-lg mt-4"
              /> */}
            </Col>
          </Row>
        </Container>
      </Container>

      {/* Services */}
      <Container className="my-5">
        <Row className="text-center mb-4">
          <Col>
            <h2 className="section-title">
  <span style={{ fontWeight: "normal", fontSize: "inherit" }}>{t("services.title")}</span>{" "}
  <span className="text-black" style={{ fontSize: "inherit" }}>{t("services.titleHighlight")}</span>
</h2>

            <p className="section-subtitle">{t("services.subtitle")}</p>
          </Col>
        </Row>
        <Row className="g-4 text-center">
          {[Truck, Headset, RotateCcw, Shield].map((Icon, idx) => {
            const keys = ["freeShipping", "support", "returns", "payment"];
            const key = keys[idx];
            return (
              <Col md={3} sm={6} key={key}>
                <div className="service-card h-100">
                  <Icon size={40} />
                  <h5 className="mt-3">{t(`services.${key}.title`)}</h5>
                  <p className="text-muted">{t(`services.${key}.text`)}</p>
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>

      {/* Team Section */}
      <Container className="team-section py-5">
        <Row className="text-center mb-4">
          <Col>
            <h2 className="section-title">
  <span style={{ fontWeight: "normal", fontSize: "inherit" }}>{t("team.title")}</span>{" "}
  <span className="text-black" style={{ fontSize: "inherit" }}>{t("team.titleHighlight")}</span>
</h2>

            <p className="section-subtitle">{t("team.subtitle")}</p>
          </Col>
        </Row>
        <div className="team-slider d-flex justify-content-center flex-wrap gap-4">
          {t("team.members", { returnObjects: true }).map((member, index) => (
            <div className="text-center team-card" key={index}>
              <img
                src={teamImages[index % teamImages.length]}
                alt={member.name}
                className="team-image"
              />
              <h5 className="mt-3">{member.name}</h5>
              <p className="text-muted">{member.position}</p>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}