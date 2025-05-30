

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Container, Row, Col, Button, ButtonGroup } from "react-bootstrap";
import './UserProfile.css';
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUserData } from "../../store/Slices/userSlice";

const UserProfile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && user.uid) {
      console.log("Fetching user data for userId:", user.uid);
      dispatch(fetchUserData(user.uid));
    }
  }, [dispatch, user]);

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
            <Button variant="secondary">{t('profile.UserProfile')}</Button>
            <Button variant="secondary" onClick={() => navigate("/userHistory")}>{t('profile.UserHistory')}</Button>
            <Button variant="secondary" onClick={() => navigate("/Cart")}>{t('profile.cart')}</Button>
            <Button variant="secondary" onClick={() => navigate("/checkout")}>{t('profile.checkout')}</Button>
            <Button variant="secondary" onClick={() => navigate("/OrderTracker")}>{t('profile.trackOrder')}</Button>
            {/* <Button variant="secondary">{t('profile.invoice')}</Button> */}
          </ButtonGroup>
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9}>
          {/* User Banner */}
          <Row className="user-banner mb-3">
            <div className="avatar-container">
              <img
                src={user.profileImage}
                alt="avatar"
                className="user-avatar"
              />
            </div>
            <div className="user-name">
              <h3>{user.fullName || "User Name"}</h3>
            </div>
            <div className="edit-btn">
              <Button variant="light" onClick={handleEdit}>
                {t('profile.edit')} ✏️
              </Button>
            </div>
          </Row>

          {/* Account Information */}
          <Row className="gi-vendor-profile-card">
            <div className="gi-vendor-card-body p-4">
              <h4 className="mb-3">{t('profile.accountInformation')}</h4>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <div className="gi-vendor-detail-block">
                    <h6>{t('profile.emailAddress')}</h6>
                    <ul>
                      <li>
                        <strong>{t('profile.email')}: </strong>{user.email || "Not provided"}
                      </li>
                    </ul>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="gi-vendor-detail-block">
                    <h6>{t('profile.contactNumber')}</h6>
                    <ul>
                      <li>
                        <strong>{t('profile.phone')}: </strong>{user.phone || "Not provided"}
                      </li>
                    </ul>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="gi-vendor-detail-block">
                    <h6>{t('profile.address')}</h6>
                    <ul>
                      {user.address && user.address.length > 0 ? (
                        user.address.map((addr, index) => (
                          <li key={index}>
                            <strong>{t('profile.address')} {index + 1}: </strong>
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