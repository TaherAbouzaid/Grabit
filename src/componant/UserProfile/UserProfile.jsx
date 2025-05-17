
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Container, Row, Col, Button, ButtonGroup } from "react-bootstrap";
import './UserProfile.css';

const UserProfile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate("/edit-profile");
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No user found</p>;

  return (
    <Container fluid className="py-3">
      <Row className="g-3">
        {/* Sidebar with Button Group */}
        <Col xs={12} md={3}>
          <ButtonGroup vertical className="btn-grp w-100">
            <Button variant="secondary">User Profile</Button>
            <Button variant="secondary">User History</Button>
            <Button variant="secondary" onClick={() => navigate("/Cart")}>Cart</Button>
            <Button variant="secondary" onClick={() => navigate("/checkout")}>Checkout</Button>
            <Button variant="secondary" onClick={() => navigate("/OrderTracker")}>Track Order</Button>
            <Button variant="secondary">Invoice</Button>
          </ButtonGroup>
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9}>
          {/* User Banner */}
          <Row className="user-banner mb-3">
            <div className="avatar-container">
              <img
                src={user.profileImage || "/placeholder-user.jpg"}
                alt="avatar"
                className="user-avatar"
              />
            </div>
            <div className="user-name">
              <h3>{user.fullName || "User Name"}</h3>
            </div>
            <div className="edit-btn">
              <Button variant="light" onClick={handleEdit}>
                Edit ✏️
              </Button>
            </div>
          </Row>

          {/* Account Information */}
          <Row className="gi-vendor-profile-card">
            <div className="gi-vendor-card-body p-4">
              <h4 className="mb-3">Account Information</h4>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <div className="gi-vendor-detail-block">
                    <h6>Email Address</h6>
                    <ul>
                      <li>
                        <strong>Email: </strong>{user.email || "Not provided"}
                      </li>
                    </ul>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="gi-vendor-detail-block">
                    <h6>Contact Number</h6>
                    <ul>
                      <li>
                        <strong>Phone: </strong>{user.phone || "Not provided"}
                      </li>
                    </ul>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="gi-vendor-detail-block">
                    <h6>Address</h6>
                    <ul>
                      {user.address && user.address.length > 0 ? (
                        user.address.map((addr, index) => (
                          <li key={index}>
                            <strong>Address {index + 1}: </strong>
                            {`${addr.street}, ${addr.city}, ${addr.regionState}, ${addr.country}, ${addr.postalCode}`}
                          </li>
                        ))
                      ) : (
                        <li>Not provided</li>
                      )}
                    </ul>
                  </div>
                </Col>
              </Row>
            </div>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;

