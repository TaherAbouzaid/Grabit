import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, ListGroup, FormCheck, Alert } from "react-bootstrap";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { useAuth } from "../../context/AuthContext.jsx";
import { doc, arrayUnion, setDoc, updateDoc, collection, getDocs, getDoc, query, where, addDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { fetchCart } from "../../Store/Slices/cartSlice";
import { fetchProducts } from "../../Store/Slices/productsSlice";
import { fetchUserData } from "../../Store/Slices/userSlice";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from 'country-state-city';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartState = useSelector(state => state.cart, shallowEqual);
  const productsState = useSelector(state => state.products, shallowEqual);
  const userState = useSelector(state => state.user, shallowEqual);
  const { items: cart, loading: cartLoading, error: cartError } = cartState;
  const { items: products, loading: productsLoading, error: productsError } = productsState;
  const { userData, loading: userLoading, error: userError } = userState;

  const [addressOption, setAddressOption] = useState("new");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    country: "",
    regionState: "",
    city: "",
    postalCode: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paypalClientId = "AYAPGHwqJNRc0be28_-MgeGH95br8WSW0MmRKqn9HJppvEZMOw3Klg0Xo-UNw-IYsdgfkSSV1nUZedm7";

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
      setSelectedState('');
      setFormData(prev => ({ ...prev, regionState: '', city: '' }));
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(stateCities);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    if (user && user.uid) {
      console.log("Fetching cart for userId:", user.uid);
      dispatch(fetchCart(user.uid));
      console.log("Fetching all products");
      dispatch(fetchProducts());
      console.log("Fetching user data for userId:", user.uid);
      dispatch(fetchUserData(user.uid));
    }
  }, [dispatch, user]);

  useEffect(() => {
    console.log("productsState:", JSON.stringify(productsState, null, 2));
  }, [productsState]);

  useEffect(() => {
    if (addressOption === "existing") {
      setFormData({
        firstName: "",
        lastName: "",
        street: "",
        country: "",
        regionState: "",
        city: "",
        postalCode: "",
      });
      setSelectedCountry('');
      setSelectedState('');
      setSelectedAddress(userData?.address?.length > 0 ? 0 : null);
    } else {
      setSelectedAddress(null);
    }
  }, [addressOption, userData]);

  const calculateCartTotals = () => {
    if (!cart || !cart.products) return { total: 0, finalTotal: 0, discount: 0 };

    let total = 0;
    let finalTotal = 0;
    let discount = 0;

    cart.products.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const quantity = item.itemQuantity;
      const unitPrice = product?.discountPrice || item.ItemsPrice / quantity;
      const originalPrice = product?.price || unitPrice;

      total += originalPrice * quantity;
      finalTotal += unitPrice * quantity;
    });

    discount = total - finalTotal;
    return { total, finalTotal, discount };
  };

  const { total, finalTotal, discount } = calculateCartTotals();
  const deliveryCharges = 24.00;
  const totalAmount = finalTotal + deliveryCharges;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (addressOption === "new") {
      if (!formData.firstName) errors.firstName = "First name is required";
      if (!formData.lastName) errors.lastName = "Last name is required";
      if (!formData.street) errors.street = "Street address is required";
      if (!formData.country) errors.country = "Country is required";
      if (!formData.regionState) errors.regionState = "Region/State is required";
      if (!formData.city) errors.city = "City is required";
      if (!formData.postalCode) errors.postalCode = "Postal code is required";
    } else if (addressOption === "existing" && selectedAddress === null) {
      errors.address = "Please select an existing address";
    }
    if (!selectedPaymentMethod) errors.paymentMethod = "Please select a payment method";
    console.log("Validation errors:", errors); // Debug validation
    return errors;
  };

  const createOrder = async (shippingAddress, paymentMethod, paypalOrderId = null) => {
    const orderRef = doc(collection(db, "orders"));
    const orderId = orderRef.id;
    const orderData = {
      couponCode: null,
      createdAt: new Date(),
      discount,
      finalTotal,
      orderId,
      paymentMethod,
      paypalOrderId,
      products: cart.products.map(item => {
        const product = products.find(p => p.id === item.productId);
        const unitPrice = product?.discountPrice || item.ItemsPrice / item.itemQuantity;
        const sku = `${product?.title?.en?.slice(0, 3) || "UNK"}-${product?.categoryId?.name?.en?.slice(0, 3) || "UNK"}`;
        return {
          price: unitPrice,
          productId: item.productId,
          quantity: item.itemQuantity,
          sku,
          variantId: "",
        };
      }),
      shippingAddress,
      status: paymentMethod === "cod" ? "pending" : "delivered",
      total,
      updatedAt: new Date(),
      userId: user.uid,
    };
    console.log("Creating order:", JSON.stringify(orderData, null, 2));
    await setDoc(orderRef, orderData);
    return orderId;
  };

  const clearCart = async () => {
    const q = query(collection(db, "Cart"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const cartDoc = querySnapshot.docs[0];
      const cartRef = doc(db, "Cart", cartDoc.id);
      console.log("Clearing cart products for userId:", user.uid);
      await updateDoc(cartRef, {
        products: [],
        updatedAt: new Date().toISOString(),
      });
      console.log("Cart products cleared successfully for userId:", user.uid);

      const updatedCartDoc = await getDoc(cartRef, { source: "server" });
      console.log("Cart after clearing (from server):", JSON.stringify(updatedCartDoc.exists() ? updatedCartDoc.data() : null, null, 2));
      if (updatedCartDoc.exists() && updatedCartDoc.data().products?.length !== 0) {
        throw new Error("Failed to clear cart products");
      }
    } else {
      console.log("No cart document found, creating empty cart for userId:", user.uid);
      const docRef = await addDoc(collection(db, "Cart"), {
        userId: user.uid,
        products: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log("Empty cart created with cartId:", docRef.id);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(db, "Users", user.uid);
      const newAddress = {
        street: formData.street,
        country: formData.country,
        regionState: formData.regionState,
        city: formData.city,
        postalCode: formData.postalCode,
      };
      console.log("Adding new address:", JSON.stringify(newAddress, null, 2));
      await updateDoc(userRef, {
        address: arrayUnion(newAddress),
        fullName: `${formData.firstName} ${formData.lastName}`,
      });
      await dispatch(fetchUserData(user.uid));
      setAddressOption("existing");
      setSelectedAddress(userData?.address?.length || 0);
      setFormErrors({});
    } catch (error) {
      console.error("Error adding address:", error.message);
      setFormErrors({ submit: `Failed to add address: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered"); // Debug form submission
    console.log("State:", { addressOption, selectedAddress, selectedPaymentMethod, cart: cart?.products, userData }); // Debug state
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.log("Validation failed:", errors);
      return;
    }

    if (!cart || !cart.products || cart.products.length === 0) {
      setFormErrors({ submit: "Cart is empty. Please add products to proceed." });
      console.log("Cart is empty");
      return;
    }

    setIsSubmitting(true);
    let orderId = null;
    try {
      console.log("Starting order processing for userId:", user.uid);
      if (!navigator.onLine) {
        throw new Error("You are offline. Please connect to the internet and try again.");
      }

      let shippingAddress = {};
      if (addressOption === "existing" && selectedAddress !== null) {
        const address = userData.address[selectedAddress];
        shippingAddress = {
          address: address.street,
          city: address.city,
          country: address.country,
          name: userData.fullName || `${formData.firstName} ${formData.lastName}`,
          phone: userData.phone || "",
          postalCode: address.postalCode,
        };
        console.log("Using existing address:", JSON.stringify(shippingAddress, null, 2));
      } else {
        const newAddress = {
          street: formData.street,
          country: formData.country,
          regionState: formData.regionState,
          city: formData.city,
          postalCode: formData.postalCode,
        };
        const userRef = doc(db, "Users", user.uid);
        console.log("Saving new address:", JSON.stringify(newAddress, null, 2));
        await updateDoc(userRef, {
          address: arrayUnion(newAddress),
          fullName: `${formData.firstName} ${formData.lastName}`,
        });
        shippingAddress = {
          address: newAddress.street,
          city: newAddress.city,
          country: newAddress.country,
          name: `${formData.firstName} ${formData.lastName}`,
          phone: userData.phone || "",
          postalCode: newAddress.postalCode,
        };
      }

      if (selectedPaymentMethod === "cod") {
        orderId = await createOrder(shippingAddress, "cod");
        await clearCart();
        dispatch(fetchUserData(user.uid));
        dispatch(fetchCart(user.uid));
        navigate("/order-confirmation", { state: { orderId } });
      } else {
        console.log("Waiting for PayPal payment approval...");
      }
    } catch (error) {
      console.error("Error processing order:", error);
      setFormErrors({ submit: `Failed to process order: ${error.message || "Unknown error"}` });
    } finally {
      if (selectedPaymentMethod === "cod") {
        setIsSubmitting(false);
      }
    }
  };

  const shippingMethods = [
    { label: "Free Shipping", rate: "$0.00", value: "free" },
    { label: "Flat Rate", rate: "$5.00", value: "flat" },
  ];

  const paymentMethods = [
    { label: "Cash On Delivery", value: "cod" },
    { label: "PayPal", value: "paypal" },
  ];

  if (cartLoading || userLoading || productsLoading) {
    return <Container fluid className="py-4 bg-white"><div>Loading...</div></Container>;
  }

  if (cartError || userError || productsError) {
    return <Container fluid className="py-4 bg-white"><div>Error: {cartError || userError || productsError}</div></Container>;
  }

  if (!user) {
    return <Container fluid className="py-4 bg-white"><div>Please log in to proceed.</div></Container>;
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return <Container fluid className="py-4 bg-white"><div>Your cart is empty.</div></Container>;
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id": paypalClientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <Container fluid className="py-4 bg-white">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Row>
              <Col md={5}>
                <Card className="border-0 mb-4 shadow-sm rounded-4">
                  <Card.Body>
                    <h3 className="mb-4 text-secondary fw-normal">Summary</h3>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between py-3 px-0 border-bottom">
                        <span>Sub-Total</span>
                        <span className="fw-bold">${total.toFixed(2)}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between py-3 px-0 border-bottom">
                        <span>Delivery Charges</span>
                        <span className="fw-bold">${deliveryCharges.toFixed(2)}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between py-3 px-0 border-bottom">
                        <span>Discount</span>
                        <span className="fw-bold">${discount.toFixed(2)}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between py-3 px-0 border-bottom">
                        <span>Coupon Discount</span>
                        <Button variant="link" className="text-success p-0">
                          Apply Discount
                        </Button>
                      </ListGroup.Item>
                    </ListGroup>
                    <div className="d-flex justify-content-between mt-3 mb-4 pt-3">
                      <h5 className="fw-normal">Total Amount</h5>
                      <h5 className="fw-bold">${totalAmount.toFixed(2)}</h5>
                    </div>

                    <div className="mt-4">
                      {cart.products.map((item) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <ProductItem
                            key={item.productId}
                            image={product?.mainImage || "https://via.placeholder.com/80"}
                            name={product?.title?.en || "Product not found"}
                            rating={product?.ratingSummary?.average || 0}
                            originalPrice={product?.price ? `$${product.price.toFixed(2)}` : null}
                            discountedPrice={`$${(product?.discountPrice || item.ItemsPrice / item.itemQuantity).toFixed(2)}`}
                          />
                        );
                      })}
                    </div>
                  </Card.Body>
                </Card>

                <Card className="mb-4 shadow-sm rounded-4">
                  <Card.Body>
                    <h5 className="fw-bold">Delivery Method</h5>
                    <p className="text-muted">
                      Please select the preferred shipping method to use on this order.
                    </p>
                    <Form>
                      {shippingMethods.map((method, index) => (
                        <Form.Check
                          type="radio"
                          id={`shipping-${method.value}`}
                          name="shipping"
                          label={`${method.label} - Rate ${method.rate}`}
                          value={method.value}
                          key={index}
                          className="mb-2"
                          defaultChecked={method.value === "free"}
                        />
                      ))}
                      <Form.Group controlId="deliveryComments" className="mt-3">
                        <Form.Label className="fw-semibold">
                          Add Comments About Your Order
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Comments"
                        />
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>

                <Card className="shadow-sm rounded-4">
                  <Card.Body>
                    <h5 className="fw-bold">Payment Method</h5>
                    <p className="text-muted">
                      Please select the preferred payment method to use on this order.
                    </p>
                    <Form>
                      {paymentMethods.map((method, index) => (
                        <Form.Check
                          type="radio"
                          id={`payment-${method.value}`}
                          name="payment"
                          label={method.label}
                          value={method.value}
                          key={index}
                          className="mb-2"
                          checked={selectedPaymentMethod === method.value}
                          onChange={handlePaymentMethodChange}
                        />
                      ))}
                      {formErrors.paymentMethod && (
                        <div className="text-danger mb-2">{formErrors.paymentMethod}</div>
                      )}
                      {selectedPaymentMethod === "paypal" && (
                        <div className="mt-3">
                          <PayPalButtons
                            style={{ layout: "vertical" }}
                            disabled={isSubmitting}
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                purchase_units: [
                                  {
                                    amount: {
                                      currency_code: "USD",
                                      value: totalAmount.toFixed(2),
                                    },
                                  },
                                ],
                              });
                            }}
                            onApprove={async (data, actions) => {
                              try {
                                setIsSubmitting(true);
                                const details = await actions.order.capture();
                                console.log("PayPal payment captured:", JSON.stringify(details, null, 2));

                                let shippingAddress = {};
                                if (addressOption === "existing" && selectedAddress !== null) {
                                  const address = userData.address[selectedAddress];
                                  shippingAddress = {
                                    address: address.street,
                                    city: address.city,
                                    country: address.country,
                                    name: userData.fullName || `${formData.firstName} ${formData.lastName}`,
                                    phone: userData.phone || "",
                                    postalCode: address.postalCode,
                                  };
                                } else {
                                  const newAddress = {
                                    street: formData.street,
                                    country: formData.country,
                                    regionState: formData.regionState,
                                    city: formData.city,
                                    postalCode: formData.postalCode,
                                  };
                                  const userRef = doc(db, "Users", user.uid);
                                  await updateDoc(userRef, {
                                    address: arrayUnion(newAddress),
                                    fullName: `${formData.firstName} ${formData.lastName}`,
                                  });
                                  shippingAddress = {
                                    address: newAddress.street,
                                    city: newAddress.city,
                                    country: newAddress.country,
                                    name: `${formData.firstName} ${formData.lastName}`,
                                    phone: userData.phone || "",
                                    postalCode: newAddress.postalCode,
                                  };
                                }

                                const orderId = await createOrder(shippingAddress, "paypal", details.id);
                                await clearCart();
                                dispatch(fetchUserData(user.uid));
                                dispatch(fetchCart(user.uid));
                                navigate("/order-confirmation", { state: { orderId } });
                              } catch (error) {
                                console.error("Error capturing PayPal payment:", error);
                                setFormErrors({ submit: `Failed to process PayPal payment: ${error.message}` });
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            onError={(err) => {
                              console.error("PayPal Buttons error:", err);
                              setFormErrors({ submit: "An error occurred with PayPal. Please try again." });
                              setIsSubmitting(false);
                            }}
                          />
                        </div>
                      )}
                      <Form.Group controlId="paymentComments" className="mt-3">
                        <Form.Label className="fw-semibold">
                          Add Comments About Your Order
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Comments"
                        />
                      </Form.Group>

                      <Form.Check
                        type="checkbox"
                        id="terms"
                        label={
                          <>
                            I have read and agree to the{" "}
                            <span className="fw-bold">Terms & Conditions</span>.
                          </>
                        }
                        className="mt-3"
                      />
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={7}>
                <Card className="border-0 mb-4 shadow-sm rounded-4">
                  <Card.Body>
                    <h3 className="mb-4 text-secondary fw-normal">Billing Details</h3>
                    <h5 className="mb-3 text-secondary">Checkout Options</h5>

                    <Form onSubmit={addressOption === "new" ? handleAddAddress : handleSubmit}>
                      <div className="mb-4">
                        <Form.Check
                          inline
                          type="radio"
                          id="existing-address"
                          name="addressOption"
                          label="I want to use an existing address"
                          checked={addressOption === "existing"}
                          onChange={() => setAddressOption("existing")}
                          className="me-4"
                          disabled={!userData?.address?.length}
                        />
                        <Form.Check
                          inline
                          type="radio"
                          id="new-address"
                          name="addressOption"
                          label="I want to use new address"
                          checked={addressOption === "new"}
                          onChange={() => setAddressOption("new")}
                        />
                      </div>

                      {formErrors.submit && (
                        <Alert variant="danger" className="mb-3">{formErrors.submit}</Alert>
                      )}
                      {formErrors.address && (
                        <Alert variant="danger" className="mb-3">{formErrors.address}</Alert>
                      )}

                      {addressOption === "existing" && userData?.address?.length > 0 ? (
                        <div className="mb-4">
                          <h6>Select an Address</h6>
                          {userData.address.map((address, index) => (
                            <Card key={index} className="mb-2 shadow-sm">
                              <Card.Body className="d-flex align-items-center">
                                <FormCheck
                                  type="radio"
                                  name="selectedAddress"
                                  id={`address-${index}`}
                                  checked={selectedAddress === index}
                                  onChange={() => setSelectedAddress(index)}
                                  className="me-3"
                                />
                                   <div className="d-flex flex-row justify-content-around w-100">
                                  <div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">Name : </p> <p> {userData.fullName}</p>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">Address : </p>
                                       <p> {address.street} </p>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">Postal Code : </p>
                                       <p>{address.postalCode}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">Country: </p>
                                     <p>{address.country}</p>
                                       </div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">State:</p> 
                                       <p>{address.regionState}</p>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">City: </p>
                                       <p>{address.city}</p>
                                    </div>
                                  </div>
                                  {/* <div>{userData.fullName}</div>
                                  <div>{address.street}</div>
                                  <div>{`${address.city}, ${address.regionState}, ${address.country}`}</div>
                                  <div>{`Postal Code: ${address.postalCode}`}</div>
                                   */}
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      ) : addressOption === "existing" ? (
                        <div className="text-muted mb-4">No saved addresses found.</div>
                      ) : (
                        <>
                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>First Name*</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="firstName"
                                  value={formData.firstName}
                                  onChange={handleInputChange}
                                  placeholder="Enter your first name"
                                  isInvalid={!!formErrors.firstName}
                                />
                                <Form.Control.Feedback type="invalid">
                                  {formErrors.firstName}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Last Name*</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleInputChange}
                                  placeholder="Enter your last name"
                                  isInvalid={!!formErrors.lastName}
                                />
                                <Form.Control.Feedback type="invalid">
                                  {formErrors.lastName}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Label>Address*</Form.Label>
                            <Form.Control
                              type="text"
                              name="street"
                              value={formData.street}
                              onChange={handleInputChange}
                              placeholder="Address Line 1"
                              isInvalid={!!formErrors.street}
                            />
                            <Form.Control.Feedback type="invalid">
                              {formErrors.street}
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Country*</Form.Label>
                                <Form.Control
                                  as="select"
                                  name="country"
                                  value={formData.country}
                                  onChange={(e) => {
                                    setSelectedCountry(e.target.value);
                                    setSelectedState('');
                                    setFormData({ ...formData, country: e.target.value });
                                    handleInputChange(e);
                                  }}
                                  isInvalid={!!formErrors.country}
                                >
                                  <option value="">Select Country</option>
                                  {countries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                      {country.name}
                                    </option>
                                  ))}
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                  {formErrors.country}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Region/State*</Form.Label>
                                <Form.Control
                                  as="select"
                                  name="regionState"
                                  value={formData.regionState}
                                  onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setFormData({ ...formData, regionState: e.target.value });
                                    handleInputChange(e);
                                  }}
                                  disabled={!selectedCountry}
                                  isInvalid={!!formErrors.regionState}
                                >
                                  <option value="">Select your state</option>
                                  {states.map((state) => (
                                    <option key={state.isoCode} value={state.isoCode}>
                                      {state.name}
                                    </option>
                                  ))}
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                  {formErrors.regionState}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>City*</Form.Label>
                                <Form.Control
                                  as="select"
                                  name="city"
                                  value={formData.city}
                                  onChange={(e) => {
                                    setFormData({ ...formData, city: e.target.value });
                                    handleInputChange(e);
                                  }}
                                  disabled={!cities.length}
                                  isInvalid={!!formErrors.city}
                                >
                                  <option value="">Select your city</option>
                                  {cities.map((city) => (
                                    <option key={city.name} value={city.name}>
                                      {city.name}
                                    </option>
                                  ))}
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                  {formErrors.city}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Postal Code*</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="postalCode"
                                  value={formData.postalCode}
                                  onChange={handleInputChange}
                                  placeholder="Postal Code"
                                  isInvalid={!!formErrors.postalCode}
                                />
                                <Form.Control.Feedback type="invalid">
                                  {formErrors.postalCode}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
                      )}

                      <div className="mt-4">
                        {addressOption === "new" ? (
                          <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 me-2"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Adding..." : "Add Address"}
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            type="submit"
                            className="px-4 py-2"
                            disabled={isSubmitting || selectedPaymentMethod === "paypal" || selectedAddress === null}
                          >
                            {isSubmitting ? "Processing..." : "Place Order"}
                          </Button>
                        )}
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </PayPalScriptProvider>
  );
}

function ProductItem({ image, name, rating, originalPrice, discountedPrice }) {
  return (
    <div className="d-flex mb-3 pb-3 border-bottom">
      <div className="me-3" style={{ width: "80px", height: "80px" }}>
        <img
          src={image}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div>
        <h6 className="mb-1">{name}</h6>
        <div className="mb-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ color: i < rating ? "#f0ad4e" : "#ccc", fontSize: "14px" }}>
              ★
            </span>
          ))}
        </div>
        <div>
          {originalPrice && (
            <span className="text-decoration-line-through text-muted me-2">{originalPrice}</span>
          )}
          <span className="fw-bold">{discountedPrice}</span>
        </div>
      </div>
    </div>
  );
}