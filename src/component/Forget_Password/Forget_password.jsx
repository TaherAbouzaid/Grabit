import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';


const ForgetPassword = () => {
  return (
    <Container className="my-5">
      <h2 className="text-center  mb-2">Forget Password</h2>
      <p className="text-center text-muted mb-1">
        Enter your email $ set Password we send you link
      </p>
      
      <Row className="justify-content-center">
        <Col md={5}>
          <div className="login-box p-4">
            <Form>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email Address*</Form.Label>
                <Form.Control type="email" placeholder="Enter your email address" />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center">
                {/* <a href="/Register" className="text-decoration-none text-muted">Create Account?</a> */}
                <Button className="login-btn" type="submit">
                  Forget
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

export default ForgetPassword;
