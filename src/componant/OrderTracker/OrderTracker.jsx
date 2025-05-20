import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { CheckCircle2, Home, Gift, Truck, Settings, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx"; // Adjust path as needed
import { db } from "../../firebase/config"; // Adjust path as needed
import { collection, query, where, getDocs } from "firebase/firestore";
import './OrderTracker.css';
import { useTranslation } from "react-i18next";

const orderSteps = [
  { id: 1, name: "Order Confirmed", icon: <CheckCircle2 size={24} /> },
  { id: 2, name: "Processing Order", icon: <Settings size={24} /> },
  { id: 3, name: "Quality Check", icon: <Gift size={24} /> },
  { id: 4, name: "Product Dispatched", icon: <Truck size={24} /> },
  { id: 5, name: "Product Delivered", icon: <Home size={24} /> },
];

export default function OrderTracker() {
  const { user } = useAuth();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    // Monitor network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user || !user.uid) {
      setError("Please log in to view your orders.");
      setLoading(false);
      return;
    }

    if (!isOnline) {
      setError("You are offline. Order data will load when you reconnect.");
      setLoading(false);
      return;
    }

    const fetchLatestOrder = async () => {
      try {
        setLoading(true);
        console.log("Querying orders for userId:", user.uid);
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        console.log("Query result:", querySnapshot.docs.map(doc => doc.data()));

        if (querySnapshot.empty) {
          setError("No orders found.");
          setOrderData(null);
          return;
        }

        // Sort orders by createdAt descending and pick the latest
        const orders = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
        const order = orders[0];

        // Map status to currentStep
        const statusToStep = {
          pending: 1, // Order Confirmed
          processing: 2, // Processing Order
          shipped: 4, // Product Dispatched (skip Quality Check)
          delivered: 5, // Product Delivered
          canceled: 0, // Special case
        };
        const currentStep = statusToStep[order.status] || 1;

        // Calculate expected date (createdAt + 3 days)
        const createdAt = order.createdAt.toDate();
        const expectedDate = new Date(createdAt);
        expectedDate.setDate(createdAt.getDate() + 3);
        const formattedDate = expectedDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        setOrderData({
          orderNumber: order.orderId,
          courier: order.courier || "Grasshoppers",
          courierCode: order.courierCode || "v534hb",
          expectedDate: formattedDate,
          currentStep,
          status: order.status,
        });
      } catch (err) {
        console.error("Error fetching order:", err);
        if (err.code === "failed-precondition" && err.message.includes("requires an index")) {
          setError(
            "Firestore query error. Please contact support to enable order tracking."
          );
        } else if (err.message.includes("client is offline")) {
          setError("You are offline. Order data will load when you reconnect.");
        } else {
          setError(`Failed to load order: ${err.message || "Please try again."}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestOrder();
  }, [user, isOnline]);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!orderData) {
    return (
      <Container className="py-5">
        <Alert variant="info" className="text-center">
          {t('profile.No orders found')}.
        </Alert>
      </Container>
    );
  }

  if (orderData.status === "canceled") {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center mb-4">
          <XCircle size={24} className="me-2" />
          {t('order.Order')} {orderData.orderNumber} {t('order.has been canceled')}.
        </Alert>
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <Card className="order-card">
              <h6 className="text-muted">{t('order.Order')}</h6>
              <h5 className="fw-semibold">{orderData.orderNumber}</h5>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="order-card">
              <h6 className="text-muted">{t('order.Courier')}</h6>
              <h5 className="fw-semibold">{orderData.courier} - {orderData.courierCode}</h5>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="order-card">
              <h6 className="text-muted">{t('order.Expected Date')}</h6>
              <h5 className="fw-semibold">{orderData.expectedDate}</h5>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="track-order-title">
          <span>{t('order.track')} </span>
          <span>{t('order.Order')}</span>
        </h1>
        <p className="text-muted mt-2">
          {t('order.We delivering happiness and needs, Faster than you can think.')}
        </p>
      </div>

      {/* Order Info */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="order-card">
            <h6 className="text-muted">{t('order.Order')}</h6>
            <h5 className="fw-semibold">{orderData.orderNumber}</h5>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="order-card">
            <h6 className="text-muted">{t('order.Courier')}</h6>
            <h5 className="fw-semibold">{orderData.courier} - {orderData.courierCode}</h5>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="order-card">
            <h6 className="text-muted">{t('order.Expected Date')}</h6>
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
                    {t(`order.${step.name}`)}
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