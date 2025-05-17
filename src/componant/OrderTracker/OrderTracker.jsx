import { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { CheckCircle2, Home, Gift, Truck, Settings } from "lucide-react";
import './OrderTracker.css';


const orderSteps = [
  { id: 1, name: "Order Confirmed", icon: <CheckCircle2 size={24} /> },
  { id: 2, name: "Processing Order", icon: <Settings size={24} /> },
  { id: 3, name: "Quality Check", icon: <Gift size={24} /> },
  { id: 4, name: "Product Dispatched", icon: <Truck size={24} /> },
  { id: 5, name: "Product Delivered", icon: <Home size={24} /> },
];


const initialOrderData = {
  orderNumber: "#6152",
  courier: "Grasshoppers",
  courierCode: "v534hb",
  expectedDate: "June 17, 2019",
  currentStep: 3,
};

export default function OrderTracker() {
  const [orderData] = useState(initialOrderData);

  return (
    <Container className="py-5">
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="track-order-title">
          <span>Track </span>
          <span>Order</span>
        </h1>
        <p className="text-muted mt-2">
          We delivering happiness and needs, Faster than you can think.
        </p>
      </div>

      {/* Order Info */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="order-card">
            <h6 className="text-muted">Order</h6>
            <h5 className="fw-semibold">{orderData.orderNumber}</h5>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="order-card">
            <h6 className="text-muted">Courier</h6>
            <h5 className="fw-semibold">{orderData.courier} - {orderData.courierCode}</h5>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="order-card">
            <h6 className="text-muted">Expected Date</h6>
            <h5 className="fw-semibold">{orderData.expectedDate}</h5>
          </Card>
        </Col>
      </Row>

      {/* Progress Steps */}
      <div className="position-relative">
        {/* Line */}
        <div className="progress-line">
          <div
            className="progress-bar"
            style={{
              width: `${(Math.min(orderData.currentStep - 1, 4) / 4) * 100}%`,
            }}
          ></div>
        </div>

        <Row className="text-center z-1">
          {orderSteps.map((step) => {
            const isComplete = step.id < orderData.currentStep;
            const isActive = step.id === orderData.currentStep;

            return (
              <Col
                key={step.id}
                md={2}
                className="mb-4 d-flex flex-column align-items-center"
              >
                <div
                  className={`step-icon ${isComplete ? "complete" : isActive ? "active" : ""}`}
                >
                  {step.icon}
                </div>
                <div>
                  <small
                    className={`step-label ${step.id <= orderData.currentStep ? "complete" : "inactive"}`}
                  >
                    {step.name}
                  </small>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </Container>
  );
}
