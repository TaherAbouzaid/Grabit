// Login.jsx
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import './Login.css'; 



const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await signInWithEmailAndPassword(auth, data.email, data.password);
      const userDoc = await getDoc(doc(db, "Users", res.user.uid));
      if (userDoc.exists()) {
        console.log("User data:", userDoc.data());
        navigate("/products");
      } else {
        console.log("No such user data in Firestore!");
      }
    } catch (error) {
    console.error("Login error:", error);
    alert("Email or password is incorrect!");
    }
  };

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
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email Address*</Form.Label>
                <Form.Control type="email" placeholder="Enter your email address"
                 {...register("email")} autoComplete="email"required />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mb-1">
                <Form.Label>Password*</Form.Label>
                <Form.Control type="password" placeholder="Enter your password"
                  {...register("password")}autoComplete="current-password" required                
                />
              </Form.Group>

              <div className="d-flex justify-content-end mb-3">
                <a href="/ForgetPassword" className="text-decoration-none text-muted">Forgot Password?</a>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <a href="/register" className="text-decoration-none text-muted">Create Account?</a>
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
