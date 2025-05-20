import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FiTruck, FiHeadphones, FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import './styles.css';



const features = [
  {
    icon: <FiTruck size={48} color="#5caf90" />,
    title: 'Free Shipping',
    desc: 'Free shipping on all US order or order above $200',
  },
  {
    icon: <FiHeadphones size={48} color="#5caf90" />,
    title: '24X7 Support',
    desc: 'Contact us 24 hours a day, 7 days a week',
  },
  {
    icon: <FiRefreshCw size={48} color="#5caf90" />,
    title: '30 Days Return',
    desc: 'Simply return it within 30 days for an exchange',
  },
  {
    icon: <FiDollarSign size={48} color="#5caf90" />,
    title: 'Payment Secure',
    desc: 'Contact us 24 hours a day, 7 days a week',
  },
];

const FeaturesRow = () => (
  <Container className="py-4">
    <Row className="features-row gx-4">
      {features.map((feature, idx) => (
        <Col key={idx} md={3} sm={6} xs={12} className="mb-3">
          <div
            className="feature-box text-center fadeup-feature"
            style={{ animationDelay: `${1 + idx * 1}s`, animationDuration: '2.5s' }}
          >
            <div className="feature-icon mb-3">{feature.icon}</div>
            <h5 className="feature-title mb-2">{feature.title}</h5>
            <p className="feature-desc mb-0">{feature.desc}</p>
          </div>
        </Col>
      ))}
    </Row>
  </Container>
);

export default FeaturesRow; 