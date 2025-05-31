import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOffers } from "../Store/Slices/offerSlice";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaTag, FaClock, FaPercent, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./OffersPage.css";

const OffersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    items: offers,
    loading,
    error,
  } = useSelector((state) => state.offers);

  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 6; // Define how many offers per page

  // Calculate date two weeks from now (May 31, 2025 + 14 days = June 14, 2025)
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

  useEffect(() => {
    dispatch(fetchOffers());
  }, [dispatch]);

  const formatDate = () => {
    return twoWeeksFromNow.toLocaleDateString(
      i18n.language === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const end = twoWeeksFromNow.getTime();
    const difference = end - now;

    if (difference <= 0) return t("offers.expired");

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleProductClick = (productId) => {
    navigate(`/shop/${productId}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(offers.length / offersPerPage);
  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = offers.slice(indexOfFirstOffer, indexOfLastOffer);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-5">
        <div className="alert alert-danger" role="alert">
          {t("common.error")}
        </div>
      </div>
    );
  }

  return (
    <Container
      className="my-5 offers-container"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <h1 className="text-center mb-4 offers-title">{t("offers.title")}</h1>
      <p className="text-center text-muted mb-5 offers-subtitle">
        {t("offers.subtitle")}
      </p>

      {offers.length === 0 ? (
        <div className="text-center my-5">
          <p className="text-muted">{t("offers.noOffers")}</p>
        </div>
      ) : (
        <>
          {/* المجموعة الأولى */}
          <Row className="g-4">
            {currentOffers.map((offer) => (
              <Col key={offer.id} xs={12} md={6} lg={4}>
                <Card className="offer-card">
                  <div
                    className="offer-image-container"
                    onClick={() => handleProductClick(offer.id)}
                  >
                    <Card.Img
                      variant="top"
                      src={offer.image}
                      alt={offer.title}
                      className="offer-image"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/300x200")
                      }
                    />
                    <div
                      className={`offer-badge ${
                        i18n.language === "ar" ? "offer-badge-rtl" : ""
                      }`}
                    >
                      <FaPercent className="me-2" />
                      {offer.discountPercentage}% OFF
                    </div>
                  </div>
                  <Card.Body className="offer-content">
                    <Card.Title
                      className="offer-title cursor-pointer"
                      onClick={() => handleProductClick(offer.id)}
                    >
                      {i18n.language === "ar" ? offer.titleAr : offer.titleEn}
                    </Card.Title>
                    <Card.Text
                      className="offer-excerpt"
                      dangerouslySetInnerHTML={{
                        __html:
                          i18n.language === "ar"
                            ? offer.descriptionAr
                            : offer.descriptionEn,
                      }}
                    />
                    <div className="d-flex align-items-center mb-3">
                      <FaClock
                        className={`me-2 ${
                          calculateTimeLeft() === t("offers.expired")
                            ? "text-danger"
                            : "text-muted"
                        }`}
                      />
                      <small
                        className={`time-left ${
                          calculateTimeLeft() === t("offers.expired")
                            ? "text-danger"
                            : "text-muted"
                        }`}
                      >
                        {t("offers.endsIn")}: {calculateTimeLeft()}
                      </small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block offer-validity">
                          {t("offers.validUntil")}: {formatDate()}
                        </small>
                      </div>
                      <Button
                        variant="success"
                        className="offer-link d-flex align-items-center"
                        onClick={() => handleProductClick(offer.id)}
                      >
                        <FaShoppingCart className="me-2" />
                        {t("offers.addToCart")}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* فاصل بين المجموعتين */}
          {offers.length > offersPerPage && (
            <div className="section-divider my-5">
              <hr />
            </div>
          )}

          {/* المجموعة الثانية */}
          {offers.length > offersPerPage && (
            <Row className="g-4">
              {currentOffers.map((offer) => (
                <Col key={offer.id} xs={12} md={6} lg={4}>
                  <Card className="offer-card">
                    <div
                      className="offer-image-container"
                      onClick={() => handleProductClick(offer.id)}
                    >
                      <Card.Img
                        variant="top"
                        src={offer.image}
                        alt={offer.title}
                        className="offer-image"
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/300x200")
                        }
                      />
                      <div
                        className={`offer-badge ${
                          i18n.language === "ar" ? "offer-badge-rtl" : ""
                        }`}
                      >
                        <FaPercent className="me-2" />
                        {offer.discountPercentage}% OFF
                      </div>
                    </div>
                    <Card.Body className="offer-content">
                      <Card.Title
                        className="offer-title cursor-pointer"
                        onClick={() => handleProductClick(offer.id)}
                      >
                        {i18n.language === "ar" ? offer.titleAr : offer.titleEn}
                      </Card.Title>
                      <Card.Text
                        className="offer-excerpt"
                        dangerouslySetInnerHTML={{
                          __html:
                            i18n.language === "ar"
                              ? offer.descriptionAr
                              : offer.descriptionEn,
                        }}
                      />
                      <div className="d-flex align-items-center mb-3">
                        <FaClock
                          className={`me-2 ${
                            calculateTimeLeft() === t("offers.expired")
                              ? "text-danger"
                              : "text-muted"
                          }`}
                        />
                        <small
                          className={`time-left ${
                            calculateTimeLeft() === t("offers.expired")
                              ? "text-danger"
                              : "text-muted"
                          }`}
                        >
                          {t("offers.endsIn")}: {calculateTimeLeft()}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted d-block offer-validity">
                            {t("offers.validUntil")}: {formatDate()}
                          </small>
                        </div>
                        <Button
                          variant="success"
                          className="offer-link d-flex align-items-center"
                          onClick={() => handleProductClick(offer.id)}
                        >
                          <FaShoppingCart className="me-2" />
                          {t("offers.addToCart")}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {offers.length > offersPerPage && (
        <Row className="mt-5">
          <Col className="d-flex justify-content-between align-items-center">
            <div className="pagination-info text-muted">
              {t("blogPage.paginationInfo", {
                first: indexOfFirstOffer + 1,
                last: Math.min(indexOfLastOffer, offers.length),
                total: offers.length,
              })}
            </div>
            <div className="pagination-controls d-flex">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`pagination-btn ${
                  currentPage === 1 ? "disabled" : ""
                }`}
                aria-label={t("blogPage.prevPage")}
              >
                {t("blogPage.prev")}
              </button>

              {[...Array(totalPages).keys()].map((number) => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`pagination-btn ${
                    currentPage === number + 1 ? "active" : ""
                  }`}
                  aria-label={t("blogPage.page", { number: number + 1 })}
                  aria-current={currentPage === number + 1 ? "page" : undefined}
                >
                  {number + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`pagination-btn next-btn ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
                aria-label={t("blogPage.nextPage")}
              >
                {t("blogPage.next")}
              </button>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default OffersPage;