import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useTranslation } from 'react-i18next';

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({ show: false, type: "", text: "" });
  const [loading, setLoading] = useState(false);
      const { t } = useTranslation();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setToast({ show: true, type: "danger", text: t("please enter you email") });
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setToast({ show: true, type: "success", text: t("Password reset link has been sent") });
    } catch (error) {
      console.error(error);
      setToast({ show: true, type: "danger", text: " Error: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-2">{t('profile.Forgot Password')}</h2>
      <p className="text-center text-muted mb-1">
        {t('profile.Enter your email & we will send you a link')}
      </p>
      
      <Row className="justify-content-center">
        <Col md={5}>
          <div className="login-box p-4">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>{t('profile.emailAddress')}*</Form.Label>
                <Form.Control
                  type="email"
                  placeholder={t("profile.Enter your email address")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center">
                <Button className="login-btn " type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      /> {t('profile.Sending...')}
                    </>
                  ) : (
                   t("profile.Send Reset Link")
                  )}
                </Button>
              </div>
            </Form>
            <div className="text-center mt-3">
              <p>
               {t('profile.Remembered your password?')}{" "}
                <a href="/login" className="text-primary">
                  {t('profile.login')}
                </a>
              </p>
              <p>
               {t("Don't have an account?")}{" "}
                <a href="/register" className="text-primary">
                 {t('profile.Sign Up')}
                </a>
              </p>

          </div>
          </div>
        </Col>

        <Col md={5} className="d-none d-md-block">
          <img
            src="https://grabit-react-next.maraviyainfotech.com/assets/img/common/login.png"
            alt="Login Visual"
            className="img-fluid rounded"
          />
        </Col>
      </Row>

      {/* Toast Notification */}
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

export default ForgetPassword;
