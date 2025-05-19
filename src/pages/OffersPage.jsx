import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOffers } from '../Store/Slices/offerSlice';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaTag, FaClock, FaPercent, FaShoppingCart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './OffersPage.css';

const OffersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { items: offers, loading, error } = useSelector((state) => state.offers);

  useEffect(() => {
    dispatch(fetchOffers());
  }, [dispatch]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTimeLeft = (endDate) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) return t('offers.expired');

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleProductClick = (productId) => {
    navigate(`/shop/${productId}`);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-5">
        <div className="alert alert-danger" role="alert">
          {t('common.error')}
        </div>
      </div>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">{t('offers.title')}</h1>
      <p className="text-center text-muted mb-5">
        {t('offers.subtitle')}
      </p>

      {offers.length === 0 ? (
        <div className="text-center my-5">
          <p className="text-muted">{t('offers.noOffers')}</p>
        </div>
      ) : (
        <Row className="g-4">
          {offers.map((offer) => (
            <Col key={offer.id} xs={12} md={6} lg={4}>
              <Card className="h-100 offer-card">
                <div 
                  className="offer-image-container"
                  onClick={() => handleProductClick(offer.id)}
                >
                  <Card.Img
                    variant="top"
                    src={offer.image}
                    alt={offer.title}
                    className="offer-image"
                  />
                  <div className="offer-badge">
                    <FaPercent className="me-2" />
                    {offer.discountPercentage}% OFF
                  </div>
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title 
                    className="mt-3 cursor-pointer"
                    onClick={() => handleProductClick(offer.id)}
                  >
                    {i18n.language === 'ar' ? offer.titleAr : offer.titleEn}
                  </Card.Title>
                  <Card.Text 
                    className="text-muted mb-3"
                    dangerouslySetInnerHTML={{ 
                      __html: i18n.language === 'ar' ? offer.descriptionAr : offer.descriptionEn 
                    }}
                  />
                  <div className="mt-auto">
                    <div className="d-flex align-items-center mb-3">
                      <FaClock className="text-muted me-2" />
                      <small className="text-muted">
                        {t('offers.endsIn')}: {calculateTimeLeft(offer.endDate)}
                      </small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block">
                          {t('offers.validUntil')}: {formatDate(offer.endDate)}
                        </small>
                      </div>
                      <Button
                        variant="success"
                        className="d-flex align-items-center"
                        onClick={() => handleProductClick(offer.id)}
                      >
                        <FaShoppingCart className="me-2" />
                        {t('offers.addToCart')}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default OffersPage; 