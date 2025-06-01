
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Row, Form, Alert } from "react-bootstrap";
import './Register.css';
import { useEffect, useState } from "react";
import { Country, State, City } from 'country-state-city';
import { useTranslation } from "react-i18next";
import { showToast } from "../../components/SimpleToastUtils";

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
    const { t } = useTranslation();


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
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const defaultProfileImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

      const userData = {
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        role: "customer",
        profileImage: defaultProfileImage, // Set default image
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

      // Save user data in Firestore (in `users` collection)
      await setDoc(doc(db, "users", user.uid), userData);

      navigate("/shop");
    } catch (error) {
      console.error("Registration error:", error);
     
      if (error.code === 'auth/email-already-in-use') {
        showToast(t("profile.Email already in use"), 'error', 3000);
      } else {
        showToast(t("profile.Error during registration. Please try again."), 'error', 3000);
      }
    }
  };

  return (     
    <Container className="mt-5">
      <div className="registration-box mx-auto" style={{ maxWidth: '900px' }}>
        <h2 className="text-center">{t('profile.register')}</h2>
        <p className="text-center text-muted mb-4">{t('profile.Best place to buy and sell digital products.')}</p>

        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formFirstName">
                <Form.Label>{t('profile.firstName')}*</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('profile.Enter your first name')}
                  isInvalid={!!errors.firstName}
                  {...register("firstName", { required:  "Please enter your first name" })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formLastName">
                <Form.Label>{t('profile.lastName')}*</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t("profile.Enter your last name")}
                  {...register("lastName")}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formEmail">
                <Form.Label>{t('profile.email')}*</Form.Label>
                <Form.Control
                  type="email"
                  placeholder={t("profile.Enter your email")}
                  isInvalid={!!errors.email}
                  {...register("email", {
                    required: t("profile.Please enter your email"),
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: t("Invalid email address")
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
                <Form.Label>{t('profile.contactNumber')}*</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t("profile.Enter your phone")}
                  isInvalid={!!errors.phone}
                  {...register("phone", {
                    required: t("Please enter your phone"),
                    pattern: {
                      value: /^\d{11}$/,
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
                <Form.Label>{t('profile.password')}*</Form.Label>
                <Form.Control
                  type="password"
                  placeholder={t("profile.Enter your password")}
                  isInvalid={!!errors.password}
                  {...register("password", {
                    required:  t("Please enter your password")
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formConfirmPassword">
                <Form.Label>{t('profile.confirmPassword')}*</Form.Label>
                <Form.Control
                  type="password"
                  placeholder= {t("profile.confirmPassword")}
                  isInvalid={!!errors.confirmPassword}
                  {...register("confirmPassword", {
                    required: t("Please confirm your password"),
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
                <Form.Label>{t('profile.address')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t("profile.address")}
                  isInvalid={!!errors.address}
                  {...register("address", {
                    required: t("Please enter your address")
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
                <Form.Label>{t('profile.country')}*</Form.Label>
                <Form.Control
                  as="select"
                  isInvalid={!!errors.country}
                  {...register("country", { required: t("Please enter your country") })}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedState('');
                  }}
                >
                  <option value="">{t('profile.Select your country')}</option>
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
                <Form.Label>{t('profile.Region State')}</Form.Label>
                <Form.Control
                  as="select"
                  isInvalid={!!errors.regionState}
                  {...register("regionState", { required: t("Please enter your region/state") })}
                  onChange={(e) => setSelectedState(e.target.value)}
                  disabled={!states.length}
                >
                  <option value="">{t('profile.Select your state')}</option>
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
                <Form.Label>{t('profile.city')}</Form.Label>
                <Form.Control
                  as="select"
                  isInvalid={!!errors.city}
                  {...register("city", { 
                    required: "Select City" })}
                  disabled={!cities.length}
                >
                  <option value="">{t('profile.Select your city')}</option>
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
                <Form.Label>{t('profile.postalCode')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t("profile.Enter your post code")}
                  isInvalid={!!errors.postCode}
                  {...register("postCode", { required: t("Please enter your postal code") })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.postCode?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted">
              {t('profile.Already have an account?')} <a href="/login">{t('profile.login')}</a>
            </div>
            <Button type="submit" className="btn-custom">
              {t('profile.register')}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Register;