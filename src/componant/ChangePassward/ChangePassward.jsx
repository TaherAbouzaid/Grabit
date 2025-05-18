import React, { useState } from "react";
import {Container,Row,Col, Form, Button,Toast,ToastContainer,} from "react-bootstrap";
import {updatePassword,reauthenticateWithCredential,EmailAuthProvider,} from "firebase/auth";
import { auth } from "../../firebase/config"; 

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState({ show: false, type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({
        show: true,
        type: "danger",
        text: "Please fill in all fields.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({
        show: true,
        type: "danger",
        text: "New passwords do not match",
      });
      return;
    }

    const user = auth.currentUser;

    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);

      try {
        // Step 1: Reauthenticate
        await reauthenticateWithCredential(user, credential);

        // Step 2: Update Password
        await updatePassword(user, newPassword);

        setToast({
          show: true,
          type: "success",
          text: "Password changed successfully ",
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error("Error updating password:", error);
        setToast({
          show: true,
          type: "danger",
          text: " Password change failed:: " + error.message,
        });
      }
    } else {
      setToast({
        show: true,
        type: "danger",
        text: "Not logged in!",
      });
    }
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-2">Change Password</h2>
      <p className="text-center text-muted mb-4">
        Enter your current and new password
      </p>

      <Row className="justify-content-center">
        <Col md={5}>
          <div className="login-box p-4">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="currentPassword" className="mb-3">
                <Form.Label>Current Password*</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="newPassword" className="mb-3">
                <Form.Label>New Password*</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Confirm New Password*</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button className="login-btn" type="submit">
                  Change Password
                </Button>
              </div>
            </Form>
          </div>
        </Col>

        <Col md={5} className="d-none d-md-block">
          <img
            src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/login.png"
            alt="Change Password Visual"
            className="img-fluid rounded"
          />
        </Col>
      </Row>

      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toast.text}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default ChangePassword;
