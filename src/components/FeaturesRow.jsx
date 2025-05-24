import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FiTruck, FiHeadphones, FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import './styles.css';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

const features = [
  {
    icon: <FiTruck size={48} color="#5caf90" />,
    key: 'freeShipping'
  },
  {
    icon: <FiHeadphones size={48} color="#5caf90" />,
    key: 'support'
  },
  {
    icon: <FiRefreshCw size={48} color="#5caf90" />,
    key: 'returns'
  },
  {
    icon: <FiDollarSign size={48} color="#5caf90" />,
    key: 'payment'
  },
];

const FeaturesRow = () => {
  useLanguage();
  const { t } = useTranslation();
  return (
    <Container className="py-4">
      <Row className="features-row gx-4">
        {features.map((feature, idx) => (
          <Col key={idx} md={3} sm={6} xs={12} className="mb-3" style={{cursor: 'pointer'}}>
            <div
              className="feature-box text-center fadeup-feature"
              style={{ animationDelay: `${1 + idx * 1}s`, animationDuration: '2.5s' }}
            >
              <div className="feature-icon mb-3">{feature.icon}</div>
              <h5 className="feature-title mb-2">{t(`services.${feature.key}.title`)}</h5>
              <p className="feature-desc mb-0">{t(`services.${feature.key}.text`)}</p>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default FeaturesRow; 
