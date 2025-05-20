import { useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function OrderConfirmation() {
  const { state } = useLocation();
  return (
    <Container className="py-4">
      <h3>Order Placed Successfully!</h3>
      <p>Order ID: {state?.orderId || "N/A"}</p>
    </Container>
  );
}