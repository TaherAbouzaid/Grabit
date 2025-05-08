import React from 'react';
import { Container, Row, Col, Form, Button, Table, Image, Breadcrumb } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './CartPage.css';
import { FaRegTrashAlt } from "react-icons/fa";


const Cart = () => {
  return (
    <Container fluid className="p-4 border rounded">

        <div className="nav d-flex justify-content-between mb-5 p-3">
            <p>Cart</p>
        
         <Breadcrumb>
          <Breadcrumb.Item  href="/src/pages/Home.jsx">Home</Breadcrumb.Item>
          <Breadcrumb.Item active style={{color:"#5caf90"}}>Cart</Breadcrumb.Item>
         </Breadcrumb>
        </div>
      <Row>
        {/* Sidebar on the left */}
        <Col md={4} className="mb-4">
          <div className="border rounded p-3 bg-light">
            <h5 className="fw-bold">Summary</h5>
            <p className="fw-semibold " >Estimate Shipping</p>
            <hr />
            <p className=' text-body-secondary' style={{fontSize:12}}>Enter your destination to get a shiping estimate</p>

            <Form>
              <Form.Group className="mb-3">
              <Form.Label style={{fontSize:14, fontWeight:'bold'}}>Country</Form.Label>
                <Form.Select >
                  <option>Country</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
              <Form.Label style={{fontSize:14, fontWeight:'bold'}}>State/Province</Form.Label>
                <Form.Select>
                  <option>State/Province</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
              <Form.Label style={{fontSize:14, fontWeight:'bold'}}>Zip/Postal Code</Form.Label>

                <Form.Control placeholder="Zip/Postal Code" style={{backgroundColor:'f8f9fa' }} />
              </Form.Group>
            </Form>
            <hr />
            <div className="d-flex justify-content-between mb-2">
              <span>Sub-Total</span>
              <span>$120.00</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Delivery Charges</span>
              <span>$24.00</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Coupon Discount</span>
              <a href="#" className="text-decoration-underline">Apply Discount</a>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total Amount</span>
              <span>$144.00</span>
            </div>
          </div>
        </Col>

        {/* Cart Items on the right */}
        <Col md={8}>
          <div className=" p-3">
            <Table responsive className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Women's wallet Hand Purse", price: 50,image: 'https://grabit-react-next.maraviyainfotech.com/assets/img/product-images/48_1.jpg' },
                  { name: "Rose Gold Earring", price: 60, image: 'https://grabit-react-next.maraviyainfotech.com/assets/img/product-images/53_1.jpg' },
                  { name: 'Apple', price: 10, image: 'https://grabit-react-next.maraviyainfotech.com/assets/img/product-images/21_1.jpg' },
                ].map((item, idx) => (
                  <tr key={idx}>
                    <td className="d-flex align-items-center">
                      <Image src={item.image} width="40" height="40" className="me-2" />
                      {item.name}
                    </td>
                    <td>${item.price}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Button size="sm" variant="light">-</Button>
                        <Form.Control className="mx-1 text-center" style={{ width: '40px' }} size="sm" value="1" readOnly />
                        <Button size="sm" variant="light">+</Button>
                      </div>
                    </td>
                    <td>${item.price}</td>
                    <td>
                      <Button variant="link" size="sm" className="text-danger p-0"><FaRegTrashAlt />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="mt-3 d-flex justify-content-between">
              <a href="#" className="text-decoration-underline fw-medium">Continue Shopping</a>
              <Button className="" variant="success">Check Out</Button>

            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
