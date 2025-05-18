"use client"

import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Main Content */}
      <main className="flex-grow-1 py-5 px-3 px-md-5 bg-white">
        {/* Get In Touch Section */}
        <Container className="mb-5">
          <div className="text-center mb-5">
            <h2 className="section-title">
              Get in <span className="text-success same-size">Touch</span>
            </h2>
            <p className="text-muted mx-auto" style={{ maxWidth: "600px" }}>
              Please select a topic below related to your inquiry. If you don't find what you need, fill out our contact form.
            </p>
          </div>

          <Row className="g-4">
            {/* Mail & Website Card */}
            <Col md={4}>
              <Card className="p-4 text-center shadow-sm h-100">
                <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: "64px", height: "64px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" viewBox="0 0 16 16">
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-7 4.2-7-4.2V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5.383z"/>
                  </svg>
                </div>
                <Card.Title className="h5 mb-3">Mail & Website</Card.Title>
                <Card.Text className="d-flex align-items-center justify-content-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" className="me-2" viewBox="0 0 16 16">
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-7 4.2-7-4.2V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5.383z"/>
                  </svg>
                  <span>mail.example@gmail.com</span>
                </Card.Text>
                <Card.Text className="d-flex align-items-center justify-content-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" className="me-2" viewBox="0 0 16 16">
                    <path d="M8 0a8 8 0 0 0-2.915 15.452c.07-.633.134-1.606 0-2.232-.135-.386-.84-1.585-.84-1.585s.208-.416.208-1.038c0-.614.356-1.072.81-1.072.444 0 .605.31.605.85 0 .518-.332.896-.564 1.108-.605.548 1.216 1.038 1.81 1.038 1.038 0 1.84-.896 1.84-2.154 0-1.126-.81-1.964-1.964-1.964-1.346 0-2.154 1.01-2.154 2.154 0 .416.156.81.416 1.038-.052.208-.208.416-.312.624-.104.208-.052.518.208.518.416 0 1.038-.605 1.038-1.038 0-.518-.416-.896-.81-.896-.416 0-.605.31-.605.81v1.038c0 .416.156.81.416 1.038-.156.518-.416 1.038-.416 1.038s-.208-.416-.416-.81c-.208-.416-.416-.81-.416-.81l-.896.416s-.416-.208-.416-.416c0-.208.208-.416.416-.416h.896c.208 0 .416-.208.416-.416 0-.208-.208-.416-.416-.416H5.038c-.416 0-.81.416-.81.896 0 2.154 1.606 3.81 3.81 3.81 2.154 0 3.81-1.656 3.81-3.81 0-.416-.052-.81-.156-1.216A3.81 3.81 0 0 0 15.452 5.038 8 8 0 0 0 8 0z"/>
                  </svg>
                  <span>www.yourdomain.com</span>
                </Card.Text>
              </Card>
            </Col>

            {/* Contact Card */}
            <Col md={4}>
              <Card className="p-4 text-center shadow-sm h-100">
                <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: "64px", height: "64px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-.678.678v12.688a.678.678 0 0 0 .678.678h8.344a.678.678 0 0 0 .678-.678V1.328a.678.678 0 0 0-.678-.678H3.654zM2.976 0h9.348A1.678 1.678 0 0 1 14 1.678v12.688A1.678 1.678 0 0 1 12.324 16H2.976A1.678 1.678 0 0 1 1.3 14.366V1.678A1.678 1.678 0 0 1 2.976 0zm5.024 4.5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5zm0 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                  </svg>
                </div>
                <Card.Title className="h5 mb-3">Contact</Card.Title>
                <Card.Text className="d-flex align-items-center justify-content-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" className="me-2" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-.678.678v12.688a.678.678 0 0 0 .678.678h8.344a.678.678 0 0 0 .678-.678V1.328a.678.678 0 0 0-.678-.678H3.654zM2.976 0h9.348A1.678 1.678 0 0 1 14 1.678v12.688A1.678 1.678 0 0 1 12.324 16H2.976A1.678 1.678 0 0 1 1.3 14.366V1.678A1.678 1.678 0 0 1 2.976 0zm5.024 4.5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5zm0 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                  </svg>
                  <span>(+91)-9876XXXXX</span>
                </Card.Text>
                <Card.Text className="d-flex align-items-center justify-content-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" className="me-2" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-.678.678v12.688a.678.678 0 0 0 .678.678h8.344a.678.678 0 0 0 .678-.678V1.328a.678.678 0 0 0-.678-.678H3.654zM2.976 0h9.348A1.678 1.678 0 0 1 14 1.678v12.688A1.678 1.678 0 0 1 12.324 16H2.976A1.678 1.678 0 0 1 1.3 14.366V1.678A1.678 1.678 0 0 1 2.976 0zm5.024 4.5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5zm0 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                  </svg>
                  <span>(+91)-987654XXXX</span>
                </Card.Text>
              </Card>
            </Col>

            {/* Address Card */}
            <Col md={4}>
              <Card className="p-4 text-center shadow-sm h-100">
                <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: "64px", height: "64px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" viewBox="0 0 16 16">
                    <path d="M8 1a3 3 0 0 0-3 3c0 1.52 1.09 2.775 2.52 2.97A5.002 5.002 0 0 0 3 9c0 2.21 1.79 4 4 4 1.08 0 2.06-.43 2.78-1.13A3 3 0 0 0 11 4a3 3 0 0 0-3-3zm0 1a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2zm0 12c-1.66 0-3-1.34-3-3 0-.55.45-1 1-1h4c.55 0 1 .45 1 1 0 1.66-1.34 3-3 3z"/>
                  </svg>
                </div>
                <Card.Title className="h5 mb-3">Address</Card.Title>
                <Card.Text className="d-flex align-items-center justify-content-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" className="me-2 flex-shrink-0" viewBox="0 0 16 16">
                    <path d="M8 1a3 3 0 0 0-3 3c0 1.52 1.09 2.775 2.52 2.97A5.002 5.002 0 0 0 3 9c0 2.21 1.79 4 4 4 1.08 0 2.06-.43 2.78-1.13A3 3 0 0 0 11 4a3 3 0 0 0-3-3zm0 1a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2zm0 12c-1.66 0-3-1.34-3-3 0-.55.45-1 1-1h4c.55 0 1 .45 1 1 0 1.66-1.34 3-3 3z"/>
                  </svg>
                  <span>Ruami Mello Moraes Filho, 987 - Salvador - MA, 40352, Brazil.</span>
                </Card.Text>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Map and Contact Form Section */}
        <Container>
          <Row className="g-4">
            {/* Google Map */}
            <Col md={6}>
              <div className="w-100 h-100 position-relative rounded border" style={{ minHeight: "400px" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15551.786973929228!2d-38.50290145!3d-12.97148695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7161b1579c9fc75%3A0x6e5ad67f55b7c2cf!2sSalvador%2C%20State%20of%20Bahia%2C%20Brazil!5e0!3m2!1sen!2sus!4v1621436435154!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <div className="position-absolute bottom-0 start-0 m-2 text-xs bg-white px-2 py-1 rounded">
                  <a href="#" className="text-primary">View larger map</a>
                </div>
              </div>
            </Col>

            {/* Contact Form */}
            <Col md={6}>
              <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="p-3 rounded"
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="p-3 rounded"
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="p-3 rounded"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    name="message"
                    placeholder="Message"
                    value={formData.message}
                    onChange={handleChange}
                    className="p-3 rounded"
                    style={{ minHeight: "150px" }}
                    required
                  />
                </Form.Group>
                <div>
                  <Button type="submit" variant="success" className="px-4 py-2">Submit</Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
      </main>

      {/* Back to Top Button */}
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        variant="dark"
        className="position-fixed bottom-0 end-0 m-4 p-2 rounded shadow"
        aria-label="Back to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </Button>
    </div>
  );
}