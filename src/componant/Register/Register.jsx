// Register.jsx
import {  useForm } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Row,Form } from "react-bootstrap";
import './Register.css';
import { useEffect, useState } from "react";
import { Country, State, City } from 'country-state-city';



const Register = () => {
const { register, handleSubmit, watch, formState: { errors } } = useForm();
const navigate = useNavigate();

 const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');


   useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry);
      setStates(countryStates);
      setCities([]);
    }
  }, [selectedCountry]);

   useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(stateCities);
    }
  }, [selectedCountry, selectedState]);




  const onSubmit = async (data) => {
    try {
      const userCredential  = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

 const userData = {
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        role: "customer",
        profileImage: "",
         address: [
          {
            country: countries.find(c => c.isoCode === data.country)?.name || '',
            city: cities.find(c => c.name === data.city)?.name || '',
            regionState: states.find(s => s.isoCode === data.regionState)?.name || '',
            street: data.address,
            postalCode: data.postCode || ""
          }
        ],
        wishlist: [], 
        selected: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 3. Save user data in Firestore (in `Users` collection)
      await setDoc(doc(db, "users", user.uid), userData);

      alert("Registered successfully!");
         navigate("/products");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong!");
    }

   
  };

  return (
    <>
     <Container className="mt-5">
      <div className="registration-box mx-auto" style={{ maxWidth: '900px' }}>
        <h2 className="text-center">Register</h2>
        <p className="text-center text-muted mb-4">Best place to buy and sell digital products.</p>

        <Form onSubmit={handleSubmit(onSubmit)} noValidate >
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formFirstName">
                <Form.Label>First Name*</Form.Label>
                <Form.Control type="text" placeholder="Enter your first name"
                  isInvalid={!!errors.firstName}
                  {...register("firstName", { required: "First name is required" })} />
                   <Form.Control.Feedback type="invalid">
                      {errors.firstName?.message}
                    </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formLastName">
                <Form.Label>Last Name*</Form.Label>
                <Form.Control type="text" placeholder="Enter your last name" {...register("lastName")}  />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formEmail">
                <Form.Label>Email*</Form.Label>
                <Form.Control type="email" placeholder="Enter your email"
                 isInvalid={!!errors.email}
                 {...register("email", {
                 required: "Email is required",
                 pattern: {
                   value: /^\S+@\S+\.\S+$/,
                    message: "Invalid email address"
                          }
                    })}
                />
               <Form.Control.Feedback type="invalid">
                {errors.email?.message}
               </Form.Control.Feedback>
            </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formPhoneNumber">
                <Form.Label>Phone Number*</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter phone number"
                  isInvalid={!!errors.phone}
                   {...register("phone", {
                  required: "Phone number is required",
                    pattern: {
                    value: /^\d{10}$/,
                    message: "Phone number must be 10 digits"
                   }
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone?.message}
                  </Form.Control.Feedback>   
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPassword">
                <Form.Label>Password*</Form.Label>
                <Form.Control type="password" placeholder="Enter your password"
                 isInvalid={!!errors.password}
                   {...register("password", {
                   required: "Password is required"
                    })}
                  />
              <Form.Control.Feedback type="invalid">
                 {errors.password?.message}
                </Form.Control.Feedback>
                                   

              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formConfirmPassword">
                <Form.Label>Confirm Password*</Form.Label>
                <Form.Control type="password" placeholder="Confirm your password"
                  isInvalid={!!errors.confirmPassword}
                 {...register("confirmPassword", {required: "Please confirm your password",
                   validate: (value) => value === watch("password") || "Passwords do not match"
                  })}
                />
                 <Form.Control.Feedback type="invalid">
                   {errors.confirmPassword?.message}
                 </Form.Control.Feedback>

              </Form.Group>
            </Col>
          </Row>

           <Row className="mb-3">
            <Col>
              <Form.Group controlId="formAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control type="text" placeholder="Address Line 1"
                  isInvalid={!!errors.address}
                  {...register("address", {
                   required: "Address is required"
                    })}
                />
                  <Form.Control.Feedback type="invalid">
                    {errors.address?.message}
                  </Form.Control.Feedback>
              </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formCountry">
                <Form.Label>Country*</Form.Label>
                <Form.Control
                  as="select"
                  isInvalid={!!errors.country}
                  {...register("country", { required: "Select Country" })}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedState('');
                  }}
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.country?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formRegionState">
                <Form.Label>Region State</Form.Label>
                <Form.Control
                  as="select"
                 isInvalid={!!errors.regionState}

                  {...register("regionState", { required: "Region/State is required" })}
                  onChange={(e) => setSelectedState(e.target.value)}
                  disabled={!states.length}
                >
                  <option value="">Select your state</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </Form.Control>
                 <Form.Control.Feedback type="invalid">
                  {errors.regionState?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>


          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formCity">
                <Form.Label>City</Form.Label>
                <Form.Control
                  as="select"
                  isInvalid={!!errors.city}

                  {...register("city", { 
                    required: "Select City" })}
                  disabled={!cities.length}
                >
                  <option value="">Select your city</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </Form.Control>
                 <Form.Control.Feedback type="invalid">
                  {errors.city?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formPostCode">
                <Form.Label>Post Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your post code"
                  isInvalid={!!errors.postCode}
                  {...register("postCode", { required: "Post code is required" })}
                />
                 <Form.Control.Feedback type="invalid">
                  {errors.postCode?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted">
              Already have an account? <a href="/login">Login</a>
            </div>
            <Button type="submit" className="btn-custom">
              Register
            </Button>
          </div>

    </Form>
    </div>
    </Container>
    </>
  );
};

export default Register;
