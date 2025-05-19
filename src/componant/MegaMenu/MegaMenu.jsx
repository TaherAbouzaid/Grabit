import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const MegaMenu = () => {
  const { t } = useTranslation();

  return (
    <div className="mega-menu">
      <Container>
        <Row>
          <Col md={3}>
            <h6 className="mb-3">{t('categories.home_kitchen')}</h6>
            <ul className="list-unstyled">
              <li><a href="#kitchen1">{t('categories.kitchen1')}</a></li>
              <li><a href="#kitchen2">{t('categories.kitchen2')}</a></li>
              <li><a href="#kitchen3">{t('categories.kitchen3')}</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6 className="mb-3">{t('categories.health_beauty')}</h6>
            <ul className="list-unstyled">
              <li><a href="#beauty1">{t('categories.beauty1')}</a></li>
              <li><a href="#beauty2">{t('categories.beauty2')}</a></li>
              <li><a href="#beauty3">{t('categories.beauty3')}</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6 className="mb-3">{t('categories.foods')}</h6>
            <ul className="list-unstyled">
              <li><a href="#food1">{t('categories.food1')}</a></li>
              <li><a href="#food2">{t('categories.food2')}</a></li>
              <li><a href="#food3">{t('categories.food3')}</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6 className="mb-3">{t('categories.health_devices')}</h6>
            <ul className="list-unstyled">
              <li><a href="#device1">{t('categories.device1')}</a></li>
              <li><a href="#device2">{t('categories.device2')}</a></li>
              <li><a href="#device3">{t('categories.device3')}</a></li>
            </ul>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MegaMenu;
