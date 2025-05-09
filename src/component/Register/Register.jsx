import React from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import "../Register/Register.css"; 

const Register = () => {
  return (
    <Container className="mt-5">
      <div className="registration-box mx-auto" style={{ maxWidth: '900px' }}>
        <h2 className="text-center">Register</h2>
        <p className="text-center text-muted mb-4">Best place to buy and sell digital products.</p>

        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formFirstName">
                <Form.Label>First Name*</Form.Label>
                <Form.Control type="text" placeholder="Enter your first name" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formLastName">
                <Form.Label>Last Name*</Form.Label>
                <Form.Control type="text" placeholder="Enter your last name" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formEmail">
                <Form.Label>Email*</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formPhoneNumber">
                <Form.Label>Phone Number*</Form.Label>
                <Form.Control type="text" placeholder="Enter your phone number" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPassword">
                <Form.Label>Password*</Form.Label>
                <Form.Control type="password" placeholder="Enter your password" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formConfirmPassword">
                <Form.Label>Confirm Password*</Form.Label>
                <Form.Control type="password" placeholder="Confirm your password" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control type="text" placeholder="Address Line 1" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formCountry">
                <Form.Label>Country*</Form.Label>
                <Form.Control as="select">
                  <option>Select your country</option>
                  <option>Egypt</option>
                  <option>UAE</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formRegionState">
                <Form.Label>Region State</Form.Label>
                <Form.Control type="text" placeholder="Enter your region/state" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formCity">
                <Form.Label>City</Form.Label>
                <Form.Control type="text" placeholder="Enter your city" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formPostCode">
                <Form.Label>Post Code</Form.Label>
                <Form.Control type="text" placeholder="Enter your post code" />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted">
              Already have an account? <a href="/Login">Login</a>
            </div>
            <Button type="submit" className="btn-custom">
              Register
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Register;
