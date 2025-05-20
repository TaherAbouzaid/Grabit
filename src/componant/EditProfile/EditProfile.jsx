import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, auth, storage } from "../../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
// import { sendPasswordResetEmail } from "firebase/auth";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Country, State, City } from "country-state-city";
import {  ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditProfile.css";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

const EditProfile = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      cityCode: "",
      regionState: "",
      stateCode: "",
      country: "",
      countryCode: "",
      postalCode: "",
    },
    profileImage: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [oldImagePath, setOldImagePath] = useState("");
  const [errors, setErrors] = useState({});
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [resetMessage, setResetMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();
      const { t } = useTranslation();
        const { currentLanguage } = useLanguage();
      

  

  const countries = Country.getAllCountries();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userAddress = userData.address?.[0] || {
            street: "",
            city: "",
            regionState: "",
            country: "",
            postalCode: "",
          };

          const country = countries.find((c) => c.name === userAddress.country);
          const countryCode = country?.isoCode || "";
          const statesList = countryCode ? State.getStatesOfCountry(countryCode) : [];
          const state = statesList.find((s) => s.name === userAddress.regionState);
          const stateCode = state?.isoCode || "";
          const citiesList = countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : [];

          setForm({
            fullName: userData.fullName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: {
              street: userAddress.street || "",
              city: userAddress.city || "",
              cityCode: userAddress.city || "",
              regionState: userAddress.regionState || "",
              stateCode: stateCode || "",
              country: userAddress.country || "",
              countryCode: countryCode || "",
              postalCode: userAddress.postalCode || "",
            },
            profileImage: userData.profileImage || "",
          });

          setStates(statesList);
          setCities(citiesList);

          const match = userData.profileImage?.match(/%2F(.+)\?/);
          if (match) {
            setOldImagePath(match[1]);
          }
        }
      }
    };
    fetchData();
  }, [navigate]);

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    const country = countries.find((c) => c.isoCode === countryCode);
    const newStates = countryCode ? State.getStatesOfCountry(countryCode) : [];

    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        country: country?.name || "",
        countryCode,
        regionState: "",
        stateCode: "",
        city: "",
        cityCode: "",
      },
    }));
    setStates(newStates);
    setCities([]);
    setErrors((prev) => ({
      ...prev,
      "address.country": "",
      "address.regionState": "",
      "address.city": "",
    }));
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    const state = states.find((s) => s.isoCode === stateCode);
    const newCities = form.address.countryCode && stateCode
      ? City.getCitiesOfState(form.address.countryCode, stateCode)
      : [];

    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        regionState: state?.name || "",
        stateCode,
        city: "",
        cityCode: "",
      },
    }));
    setCities(newCities);
    setErrors((prev) => ({ ...prev, "address.regionState": "", "address.city": "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const field = name.split(".")[1];
      if (field === "cityCode") {
        const city = cities.find((c) => c.name === value);
        setForm((prev) => ({
          ...prev,
          address: { ...prev.address, city: city?.name || value, cityCode: value },
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          address: { ...prev.address, [field]: value },
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setErrors((prev) => ({ ...prev, profileImage: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = "Full name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.address.street) newErrors["address.street"] = "Street is required";
    if (!form.address.city) newErrors["address.city"] = "City is required";
    if (!form.address.regionState) newErrors["address.regionState"] = "Region/State is required";
    if (!form.address.country) newErrors["address.country"] = "Country is required";
    if (!form.address.postalCode) newErrors["address.postalCode"] = "Postal code is required";
    return newErrors;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userRef = doc(db, "users", uid);
    let profileImage = form.profileImage;

    try {
      if (imageFile) {
        const imageRef = ref(storage, `profileImage/${uid}-${Date.now()}`);
        if (oldImagePath) {
          const oldRef = ref(storage, `profileImage/${oldImagePath}`);
          await deleteObject(oldRef).catch((err) => {
            console.warn("Old image not deleted:", err.message);
          });
        }
        await uploadBytes(imageRef, imageFile);
        profileImage = await getDownloadURL(imageRef);
      }

      await updateDoc(userRef, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: [{
          street: form.address.street,
          city: form.address.city,
          regionState: form.address.regionState,
          country: form.address.country,
          postalCode: form.address.postalCode,
        }],
        profileImage,
      });

      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ submit: "Failed to update profile. Please try again." });
    }
  };

  // const handleResetPassword = async () => {
  //   setResetMessage({ type: "", text: "" });
  //   if (!auth.currentUser?.email) {
  //     setResetMessage({ type: "danger", text: "No email associated with this account." });
  //     toast.error("No email associated with this account.", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //     return;
  //   }

  //   const toastId = toast.loading("Sending password reset email...", {
  //     position: "top-right",
  //   });

  //   try {
  //     await sendPasswordResetEmail(auth, auth.currentUser.email);
  //     toast.update(toastId, {
  //       render: "Password reset email sent. Check your inbox.",
  //       type: "success",
  //       isLoading: false,
  //       autoClose: 3000,
  //     });
  //     setResetMessage({ type: "success", text: "Password reset email sent. Check your inbox." });
  //   } catch (error) {
  //     console.error("Error sending password reset email:", error.message);
  //     toast.update(toastId, {
  //       render: `Failed to send reset email: ${error.message}`,
  //       type: "error",
  //       isLoading: false,
  //       autoClose: 5000,
  //     });
  //     setResetMessage({ type: "danger", text: `Failed to send reset email: ${error.message}` });
  //   }
  // };

  return (
    <Container fluid className="edit-profile py-4">
      <ToastContainer />
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <div className="login-box p-4 shadow-sm rounded">
            <h3 className="mb-3">{t('profile.editProfile')}</h3>
            <p className="text-muted mb-4">{t('profile.Update your personal information')}</p>

            {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
            {resetMessage.text && (
              <Alert variant={resetMessage.type} onClose={() => setResetMessage({ type: "", text: "" })} dismissible>
                {resetMessage.text}
              </Alert>
            )}

            <Form onSubmit={handleSave}>
              <Form.Group controlId="formFullName" className="mb-3">
                <Form.Label>{t('profile.fullName')}*</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  isInvalid={!!errors.fullName}
                />
                <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>{t('profile.email')}*</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formPhone" className="mb-3">
                <Form.Label>{t('profile.phone')}</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </Form.Group>

              <Form.Group controlId="formAddressStreet" className="mb-3">
                <Form.Label>{t('profile.streetAddress')}*</Form.Label>
                <Form.Control
                  type="text"
                  name="address.street"
                  value={form.address.street}
                  onChange={handleChange}
                  placeholder="Enter your street address"
                  isInvalid={!!errors["address.street"]}
                />
                <Form.Control.Feedback type="invalid">{errors["address.street"]}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formAddressCountry" className="mb-3">
                <Form.Label>{t('profile.country')}*</Form.Label>
                <Form.Select
                  name="address.countryCode"
                  value={form.address.countryCode}
                  onChange={handleCountryChange}
                  isInvalid={!!errors["address.country"]}
                >
                  <option value="">{t('profile.selectCountry')}</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors["address.country"]}</Form.Control.Feedback>
              </Form.Group>

              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group controlId="formAddressState">
                    <Form.Label>{t('profile.region/state')}*</Form.Label>
                    <Form.Select
                      name="address.stateCode"
                      value={form.address.stateCode}
                      onChange={handleStateChange}
                      disabled={!form.address.countryCode}
                      isInvalid={!!errors["address.regionState"]}
                    >
                      <option value="">{t('profile.SelectState')}</option>
                      {states.map((state) => (
                        <option key={state.isoCode} value={state.isoCode}>
                          {state.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors["address.regionState"]}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="formAddressCity">
                    <Form.Label>{t('profile.city')}*</Form.Label>
                    <Form.Select
                      name="address.cityCode"
                      value={form.address.cityCode}
                      onChange={handleChange}
                      disabled={!form.address.stateCode}
                      isInvalid={!!errors["address.city"]}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors["address.city"]}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="formAddressPostalCode" className="mb-3">
                <Form.Label>{t('profile.postalCode')}*</Form.Label>
                <Form.Control
                  type="text"
                  name="address.postalCode"
                  value={form.address.postalCode}
                  onChange={handleChange}
                  placeholder="Enter your postal code"
                  isInvalid={!!errors["address.postalCode"]}
                />
                <Form.Control.Feedback type="invalid">{errors["address.postalCode"]}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formProfileImage" className="mb-3">
                <Form.Label>{t('profile.profileImage')}</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                {form.profileImage && (
                  <div className="mt-2">
                    <img
                      src={form.profileImage}
                      alt="Profile Preview"
                      className="profile-preview-img"
                    />
                  </div>
                )}
              </Form.Group>

             <div>

              <Link to="/ChangePassword" > {t('profile.changePassword')}</Link>
             </div>

              <div className="d-flex justify-content-between ">
                <Button variant="secondary" onClick={() => navigate("/profile")}>
                  {t('profile.cancel')}
                </Button>
                <Button variant="success" type="submit">
                  {t('profile.save')}
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;