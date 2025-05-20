import React, { useState, useEffect } from "react";
import { Table, Button, Container, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx"; // Adjust path as needed
import { db } from "../../firebase/config"; // Adjust path as needed
import { collection, query, where, getDocs } from "firebase/firestore";
import "./UserOrder.css";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";

const OrderList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

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

    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log("Querying orders for userId:", user.uid);
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        console.log("Query result:", querySnapshot.docs.map(doc => doc.data()));

        const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Categorize orders
        const pending = orders
          .filter(order => ["pending", "processing", "shipped"].includes(order.status))
          .map(order => ({
            id: order.orderId,
            shipping: order.courier ? `${order.courier} - ${order.courierCode || "N/A"}` : "Grasshoppers - v534hb",
            quantity: order.products?.reduce((sum, product) => sum + (product.quantity || 0), 0) || 1,
            date: order.createdAt?.toDate().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }) || "N/A",
            price: order.total ? `$${order.total.toFixed(2)}` : "$0.00",
            status: order.status,
          }));

        const completed = orders
          .filter(order => ["delivered", "canceled"].includes(order.status))
          .map(order => ({
            id: order.orderId,
            shipping: order.courier ? `${order.courier} - ${order.courierCode || "N/A"}` : "Grasshoppers - v534hb",
            quantity: order.products?.reduce((sum, product) => sum + (product.quantity || 0), 0) || 1,
            date: order.createdAt?.toDate().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }) || "N/A",
            price: order.total ? `$${order.total.toFixed(2)}` : "$0.00",
            status: order.status,
          }));

        setPendingOrders(pending);
        setCompletedOrders(completed);
        if (orders.length === 0) {
          setError("No orders found.");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        if (err.message.includes("client is offline")) {
          setError("You are offline. Order data will load when you reconnect.");
        } else if (err.code === "failed-precondition" && err.message.includes("requires an index")) {
          setError("Firestore query error. Please contact support to enable order tracking.");
        } else {
          setError(`Failed to load orders: ${err.message || "Please try again."}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isOnline]);

  const renderTable = (orders, isCompleted) => (
    <Table bordered responsive className="mb-0 custom-table">
      <thead className="table-header">
        <tr className="text-secondary">
          <th>{t('order.Orders ID')}</th>
          <th>{t('order.Shipping')}</th>
          <th>{t('order.Quantity')}</th>
          <th>{t('order.Date')}</th>
          <th>{t('order.Price')}</th>
          <th>{t('order.Status')}</th>
        </tr>
      </thead>
      <tbody>
        {orders.length === 0 ? (
          <tr>
            <td colSpan="7" className="text-center text-muted">
              {t('order.No')} {isCompleted ? t('order.completed') : t('order.pending')} {t('order.orders found')}.
            </td>
          </tr>
        ) : (
          orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.shipping}</td>
              <td>{order.quantity}</td>
              <td>{order.date}</td>
              <td>{order.price}</td>
              <td style={{ color: isCompleted ? "#e58a8a" : "#5cc28c" }}>{t(`order.${order.status}`)}</td>
         
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );

  if (loading) {
    return (
      <Container style={{ maxWidth: "100%" }} className="py-5">
        <div className="text-center">Loading orders...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ maxWidth: "1100px" }} className="py-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container  className="py-5">
      <div className="text-center mb-4">
        <h4 className="fw-bold">
          Product <span style={{ color: "#5cc28c" }}>Order List</span>
        </h4>
        <p className="text-muted">Your product Order is our first priority.</p>
      </div>

      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="success"
          className="shop-now-button"
          onClick={() => navigate("/shop")}
        >
          Shop Now
        </Button>
      </div>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom fw-bold card-header">
          PENDING ORDERS
        </Card.Header>
        <Card.Body className="p-0">{renderTable(pendingOrders, false)}</Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom fw-bold card-header">
          COMPLETE ORDERS
        </Card.Header>
        <Card.Body className="p-0">{renderTable(completedOrders, true)}</Card.Body>
      </Card>
    </Container>
  );
};

export default OrderList;