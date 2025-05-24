import React, { useState, useEffect } from "react";
import { Table, Button, Container, Card, Alert, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../firebase/config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import "./UserOrder.css";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";

const OrderList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [canceledOrders, setCanceledOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { t } = useTranslation();
  useLanguage();

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No orders found.");
        setPendingOrders([]);
        setCompletedOrders([]);
        setCanceledOrders([]);
        setLoading(false);
        return;
      }

      console.log("Found orders:", querySnapshot.size);
      
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Order data:", data);
        return {
          docId: doc.id, // Store the document ID for updating
          ...data,
          // Ensure status is standardized (handle both 'canceled' and 'cancelled')
          status: data.status === 'cancelled' ? 'canceled' : (data.status || 'pending')
        };
      });

      // Sort orders by date (newest first)
      orders.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      });

      // Log all orders with their status for debugging
      orders.forEach(order => {
        console.log(`Order ${order.orderId}: status = ${order.status}`);
      });

      const pending = orders
        .filter(order => ["pending", "processing", "shipped"].includes(order.status))
        .map(order => ({
          id: order.orderId || order.docId,
          docId: order.docId, // Include document ID
          shipping: order.courier ? `${order.courier} - ${order.courierCode || "N/A"}` : "Grasshoppers - v534hb",
          quantity: order.products?.reduce((sum, product) => sum + (product.quantity || 0), 0) || 1,
          date: order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) : "N/A",
          price: order.total ? `$${order.total.toFixed(2)}` : "$0.00",
          status: order.status,
        }));

      const completed = orders
        .filter(order => ["delivered"].includes(order.status))
        .map(order => ({
          id: order.orderId || order.docId,
          docId: order.docId, // Include document ID
          shipping: order.courier ? `${order.courier} - ${order.courierCode || "N/A"}` : "Grasshoppers - v534hb",
          quantity: order.products?.reduce((sum, product) => sum + (product.quantity || 0), 0) || 1,
          date: order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) : "N/A",
          price: order.total ? `$${order.total.toFixed(2)}` : "$0.00",
          status: order.status,
        }));
        
      const canceled = orders
        .filter(order => ["canceled", "cancelled"].includes(order.status))
        .map(order => ({
          id: order.orderId || order.docId,
          docId: order.docId, // Include document ID
          shipping: order.courier ? `${order.courier} - ${order.courierCode || "N/A"}` : "Grasshoppers - v534hb",
          quantity: order.products?.reduce((sum, product) => sum + (product.quantity || 0), 0) || 1,
          date: order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) : "N/A",
          price: order.total ? `$${order.total.toFixed(2)}` : "$0.00",
          status: order.status,
        }));

      console.log("Pending orders:", pending.length);
      console.log("Completed orders:", completed.length);
      console.log("Canceled orders:", canceled.length);

      setPendingOrders(pending);
      setCompletedOrders(completed);
      setCanceledOrders(canceled);
      if (orders.length === 0) {
        setError("No orders found.");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.uid) {
      fetchOrders();
    } else {
      setError("Please log in to view your orders.");
      setLoading(false);
    }
  }, [user]);

  // Function to handle order cancellation
  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    
    try {
      setCancelLoading(true);
      
      // Find the order in pendingOrders using the selectedOrderId
      const orderToCancel = pendingOrders.find(order => order.id === selectedOrderId);
      
      if (!orderToCancel || !orderToCancel.docId) {
        throw new Error("Order not found");
      }
      
      // Update the order status in Firestore
      const orderRef = doc(db, "orders", orderToCancel.docId);
      await updateDoc(orderRef, {
        status: "canceled"
      });
      
      // Close modal and refresh orders
      setShowCancelModal(false);
      setSelectedOrderId(null);
      await fetchOrders();
      
    } catch (error) {
      console.error("Error canceling order:", error);
      setError(`Failed to cancel order: ${error.message}`);
    } finally {
      setCancelLoading(false);
    }
  };

  // Function to open cancel confirmation modal
  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const renderTable = (orders, isCompleted, isCanceled = false) => {
    return (
      <Table bordered responsive className="mb-0 custom-table">
        <thead className="table-header">
          <tr className="text-secondary">
            <th>{t('order.Orders ID')}</th>
            <th>{t('order.Shipping')}</th>
            <th>{t('order.Quantity')}</th>
            <th>{t('order.Date')}</th>
            <th>{t('order.Price')}</th>
            <th>{t('order.Status')}</th>
            {!isCompleted && !isCanceled && <th>{t('order.Actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={isCompleted || isCanceled ? "6" : "7"} className="text-center text-muted">
                {t('order.No')} {
                  isCanceled ? t('order.canceled') : 
                  isCompleted ? t('order.completed') : t('order.pending')
                } {t('order.orders found')}.
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
                <td style={{ 
                  color: order.status === "canceled" ? "#e58a8a" : 
                         order.status === "delivered" ? "#5cc28c" : 
                         "#f0ad4e" 
                }}>
                  {t(`order.${order.status}`)}
                </td>
                {!isCompleted && !isCanceled && (
                  <td>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => openCancelModal(order.id)}
                    >
                      {t('order.Cancel')}
                    </Button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    );
  };

  // Cancel Confirmation Modal
  const renderCancelModal = () => (
    <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('order.Cancel Order')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {t('order.Are you sure you want to cancel this order?')}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
          {t('common.No')}
        </Button>
        <Button 
          variant="danger" 
          onClick={handleCancelOrder}
          disabled={cancelLoading}
        >
          {cancelLoading ? t('common.Processing...') : t('common.Yes')}
        </Button>
      </Modal.Footer>
    </Modal>
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
    <Container style={{ maxWidth: "1100px" }} className="py-5">
      {/* Title */}
      <div className="text-center mb-4 ">
        <h1 className="order-title  ">
          <span style={{ fontSize: "2rem" }}>{t("order.Your")} </span>
          <span style={{ fontSize: "2rem", color: "#5cac94" }}>
            {t("order.Orders")}
          </span>
        </h1>
        <p className="text-muted mt-2" style={{fontSize:"1.3rem"}}>
          {t("order.Your product Order is our first priority.")}
        </p>
      </div>

      {/* Pending Orders */}
      <Card className="mb-4 order-card">
        <Card.Header className="bg-white">
          <h5 className="mb-0">{t("order.Pending")}</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {renderTable(pendingOrders, false)}
        </Card.Body>
      </Card>

      {/* Completed Orders */}
      <Card className="mb-4 order-card">
        <Card.Header className="bg-white">
          <h5 className="mb-0">{t("order.Completed")}</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {renderTable(completedOrders, true)}
        </Card.Body>
      </Card>

      {/* Canceled Orders */}
      <Card className="order-card">
        <Card.Header className="bg-white">
          <h5 className="mb-0">{t("order.Canceled")}</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {renderTable(canceledOrders, false, true)}
        </Card.Body>
      </Card>

      {/* Cancel Confirmation Modal */}
      {renderCancelModal()}
      <div className="d-flex justify-content-end my-5">
        <button className="btn btn-success" onClick={() => navigate("/")}> {t("order.Back to Home")}</button>
    </div>
    </Container>
  );
};

export default OrderList;
