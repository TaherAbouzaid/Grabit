"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Table, Badge, Button, Row, Col, Alert, Container } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext.jsx"; // Adjust path as needed
import { db } from "../../firebase/config"; // Adjust path as needed
import { collection, query, where, getDocs } from "firebase/firestore";
import { fetchProductById } from "../../Store/Slices/productsSlice.js"; // Adjust path as needed
import "./UserHistory.css";
import { useNavigate } from "react-router-dom";

export default function OrdersTable() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { items: products, loading: productLoading, error: productError } = useSelector(state => state.products);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

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
          setOrder(null);
          setLoading(false);
          return;
        }

        // Sort by createdAt descending and pick the latest
        const orders = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
        const latestOrder = orders[0];

        // Fetch product details for all products in the order
        const orderProducts = latestOrder.products || [];
        let productDetails = [];

        if (orderProducts.length > 0) {
          for (const orderProduct of orderProducts) {
            if (orderProduct.productId) {
              // Check if product is already in Redux state
              const cachedProduct = products.find(p => p.id === orderProduct.productId);
              if (cachedProduct) {
                productDetails.push({
                  productId: orderProduct.productId,
                  name: cachedProduct.title?.en || orderProduct.name || "Unknown Product",
                  image: cachedProduct.mainImage || orderProduct.image || "/placeholder.svg",
                  price: cachedProduct.price || orderProduct.price || 0,
                });
              } else {
                // Fetch product from Firestore
                try {
                  const result = await dispatch(fetchProductById(orderProduct.productId)).unwrap();
                  productDetails.push({
                    productId: orderProduct.productId,
                    name: result.title?.en || orderProduct.name || "Unknown Product",
                    image: result.mainImage || orderProduct.image || "/placeholder.svg",
                    price: result.price || orderProduct.price || 0,
                  });
                } catch (err) {
                  console.error(`Failed to fetch product ${orderProduct.productId}:`, err);
                  productDetails.push({
                    productId: orderProduct.productId,
                    name: orderProduct.name || "Unknown Product",
                    image: orderProduct.image || "/placeholder.svg",
                    price: orderProduct.price || 0,
                  });
                }
              }
            } else {
              productDetails.push({
                productId: null,
                name: orderProduct.name || "Unknown Product",
                image: orderProduct.image || "/placeholder.svg",
                price: orderProduct.price || 0,
              });
            }
          }
        } else {
          productDetails.push({
            productId: null,
            name: "Order Items",
            image: "/placeholder.svg",
            price: 0,
          });
        }

        // Aggregate product names and select first image
        const aggregatedName = productDetails.map(p => p.name).join(", ");
        const firstImage = productDetails[0]?.image || "/placeholder.svg";
        const statusVariant = latestOrder.status === "canceled" ? "danger" : "success";

        setOrder({
          id: latestOrder.orderId,
          image: firstImage,
          name: aggregatedName || "Order Items",
          date: latestOrder.createdAt?.toDate().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) || "N/A",
          price: latestOrder.total ? `$${latestOrder.total.toFixed(2)}` : "$0.00",
          status: latestOrder.status,
          statusVariant,
        });
      } catch (err) {
        console.error("Error fetching order:", err);
        if (err.message.includes("client is offline")) {
          setError("You are offline. Order data will load when you reconnect.");
        } else if (err.code === "failed-precondition" && err.message.includes("requires an index")) {
          setError("Firestore query error. Please contact support to enable order tracking.");
        } else {
          setError(`Failed to load order: ${err.message || "Please try again."}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestOrder();
  }, [user, isOnline, dispatch, products]);

  if (loading || productLoading) {
    return (
      <Card className="orders-card">
        <Card.Body className="card-body">
          <div className="text-center">Loading order...</div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="orders-card">
        <Card.Body className="card-body">
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!order) {
    return (
        <Container>

      <Card className="orders-card">
        <Card.Body className="card-body">
          <Alert variant="info" className="text-center">
            No orders found.
          </Alert>
        </Card.Body>
      </Card>

              </Container>

    );
  }

  return (
    <Container>
    <Card className="orders-card">
      <Card.Body className="card-body">
        <Row className="header-row">
          <Col>
            <h4 className="header-title">Latest Order</h4>
          </Col>
          <Col xs="auto">
            <Button className="header-button" onClick={()=>navigate("/OrderList")}> View All </Button>

          </Col>
        </Row>

        <div className="table-responsive">
          <Table hover className="orders-table">
            <thead>
              <tr>
                {/* <th>ID</th> */}
                <th>Image</th>
                <th>Name</th>
                <th>Date</th>
                <th>Price</th>
                {/* <th>Status</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr key={order.id}>
                {/* <td>{order.id}</td> */}
                <td>
                  <img
                    src={order.image || order.image || "/placeholder.svg"}
                    alt={order.name}
                    width={60}
                    height={60}
                    className="product-image rounded"
                  />
                </td>
                <td>{order.name}</td>
                <td>{order.date}</td>
                <td>{order.price}</td>
                {/* <td>
                  <Badge bg={order.statusVariant} className="status-badge">
                    {order.status}
                  </Badge>
                </td> */}
                <td>
                  <Button className="action-button " onClick={()=>navigate("/OrderList")}>View All</Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
    </Container>
  );
}