import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import "../Login/Login.css" 

const Login = () => {
  return (
    <Container className="my-5">
      <h2 className="text-center  mb-2">Login</h2>
      <p className="text-center text-muted mb-1">
        Get access to your Orders, Wishlist and
      </p>
      <p className="text-center text-muted mb-4">
        Recommendations.
      </p>

      <Row className="justify-content-center">
        <Col md={5}>
          <div className="login-box p-4">
            <Form>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email Address*</Form.Label>
                <Form.Control type="email" placeholder="Enter your email address" />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mb-1">
                <Form.Label>Password*</Form.Label>
                <Form.Control type="password" placeholder="Enter your password" />
              </Form.Group>

              <div className="d-flex justify-content-end mb-3">
                <a href="/ForgetPassword" className="text-decoration-none text-muted">Forgot Password?</a>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <a href="/Register" className="text-decoration-none text-muted">Create Account?</a>
                <Button className="login-btn" type="submit">
                  Login
                </Button>
              </div>
            </Form>
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
    </Container>
  );
};

export default Login;
