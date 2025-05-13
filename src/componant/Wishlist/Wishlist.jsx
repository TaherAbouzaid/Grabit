import React from 'react';
import { Container, Table, Button, Row, Col, Image, Breadcrumb } from 'react-bootstrap';
import { IoCloseSharp } from "react-icons/io5";
import { GiGymBag } from "react-icons/gi";
import './Wishlist.css'
import WishlistData from "/src/componant/Wishlist/Wishlist";



const Wishlist = () => {
  const wishlistItems = [
    {
      name: "Women's wallet Hand Purse",
      image: 'https://grabit-react-next.maraviyainfotech.com/assets/img/product-images/48_1.jpg',
      price: 50,
      status: 'Available',
    },
    {
      name: 'Rose Gold Earring',
      image: 'https://grabit-react-next.maraviyainfotech.com/assets/img/product-images/53_1.jpg',
      price: 60,
      status: 'Out Of Stock',
    },
    {
      name: 'Apple',
      image: 'https://grabit-react-next.maraviyainfotech.com/assets/img/product-images/21_1.jpg',
      price: 10,
      status: 'Available',
    },
  ];

  return (
    <Container fluid className="p-4 ">
          <div className="nav d-flex justify-content-between p-3">
                    <p>Wishlist</p>
                
                 <Breadcrumb>
                  <Breadcrumb.Item  href="/src/pages/Home.jsx">Home</Breadcrumb.Item>
                  <Breadcrumb.Item active style={{color:"#5caf90"}}>Wishlist</Breadcrumb.Item>
                 </Breadcrumb>
                </div>
      <Row className=" wishlist-header ">
        <Col>
          <h2 className="text-center fw-bold">
            Product <span>Wishlist</span>
          </h2>
          <p className="text-center text-muted">Your product wish is our first priority.</p>
        </Col>
      </Row>

      <Row> 
        <Col>
          <div className=".wishlist-card border rounded p-3 bg-white shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">WISHLIST</h5>
              <Button variant="success">Shop Now</Button>
            </div>

            <Table className=' .wishlist-table ' responsive hover >
              <thead >
                <tr > 
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody >
                {wishlistItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Image src={item.image} width="50" />
                    </td>
                    <td>{item.name}</td>
                    <td>${item.price}</td>
                    <td className={item.status === 'Available' ? 'text-success' : 'text-danger'}>
                      {item.status}
                    </td>
                    <td>
                      <Button variant="success" size="sm" className="me-2">
                      <GiGymBag />
                      </Button>
                      <Button variant="dark" size="sm">
                      <IoCloseSharp className='Color-white'/>

                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Wishlist;
