import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  FormCheck,
  Alert,
  Image,
} from "react-bootstrap";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  doc,
  arrayUnion,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  addDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { fetchCart } from "../../Store/Slices/cartSlice";
import { fetchProducts } from "../../Store/Slices/productsSlice";
import { fetchUserData } from "../../store/Slices/userSlice";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { incrementSoldCount } from "../../services/productStatsService";

const decrementStock = async (orderProducts) => {
  if (!orderProducts || orderProducts.length === 0) {
    console.error("No products provided to decrementStock function");
    return;
  }

  try {
    // معالجة كل منتج على حدة في معاملات منفصلة
    // هذا يضمن أن فشل منتج واحد لا يؤثر على البقية
    for (const item of orderProducts) {
      if (!item.productId) {
        console.error("Item missing productId:", item);
        continue;
      }

      try {
        await runTransaction(db, async (transaction) => {
          const productRef = doc(db, "allproducts", item.productId);

          // للمنتجات ذات المتغيرات
          if (item.variantId) {
            const variantRef = doc(
              db,
              "allproducts",
              item.productId,
              "variants",
              item.variantId
            );
            const variantDoc = await transaction.get(variantRef);

            if (!variantDoc.exists()) {
              console.error(
                `Variant document not found for product ID ${item.productId} and variant ID ${item.variantId}`
              );
              return;
            }

            const variantData = variantDoc.data();
            const currentQuantity = variantData.quantity || 0;
            const quantityToDecrement = item.itemQuantity || item.quantity || 1;

            if (currentQuantity < quantityToDecrement) {
              console.error(
                `Not enough stock for variant. Current: ${currentQuantity}, Requested: ${quantityToDecrement}`
              );
              return;
            }

            const newQuantity = currentQuantity - quantityToDecrement;
            transaction.update(variantRef, { quantity: newQuantity });
          } else {
            // للمنتجات البسيطة
            const productDoc = await transaction.get(productRef);

            if (!productDoc.exists()) {
              console.error(
                `Product document not found for ID ${item.productId}`
              );
              return;
            }

            const productData = productDoc.data();
            const currentQuantity = productData.quantity || 0;
            const quantityToDecrement = item.itemQuantity || item.quantity || 1;

            if (currentQuantity < quantityToDecrement) {
              console.error(
                `Not enough stock for product. Current: ${currentQuantity}, Requested: ${quantityToDecrement}`
              );
              return;
            }

            const newQuantity = currentQuantity - quantityToDecrement;
            transaction.update(productRef, { quantity: newQuantity });
          }
        });
      } catch (itemError) {
        console.error(
          `Error decrementing stock for product ${item.productId}:`,
          itemError
        );
        // استمر في المعالجة حتى لو فشل منتج واحد
      }
    }

    return true;
  } catch (error) {
    console.error("Stock decrement failed:", error);
    throw error;
  }
};

export default function CheckoutPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cartState = useSelector((state) => state.cart, shallowEqual);
  const productsState = useSelector((state) => state.products, shallowEqual);
  const userState = useSelector((state) => state.user, shallowEqual);
  const { items: cart, loading: cartLoading, error: cartError } = cartState;
  const {
    items: products,
    loading: productsLoading,
    error: productsError,
  } = productsState;
  const { userData, loading: userLoading, error: userError } = userState;
  const { currentLanguage } = useLanguage();

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

  const paypalClientId =
    "AYAPGHwqJNRc0be28_-MgeGH95br8WSW0MmRKqn9HJppvEZMOw3Klg0Xo-UNw-IYsdgfkSSV1nUZedm7";

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry);
      setStates(countryStates);
      setCities([]);
      setSelectedState("");
      setFormData((prev) => ({ ...prev, regionState: "", city: "" }));
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(stateCities);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    if (user && user.uid) {
      dispatch(fetchCart(user.uid));
      dispatch(fetchProducts());
      dispatch(fetchUserData(user.uid));
    }
  }, [dispatch, user]);

  useEffect(() => {}, [productsState]);

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
      setSelectedCountry("");
      setSelectedState("");
      setSelectedAddress(userData?.address?.length > 0 ? 0 : null);
    } else {
      setSelectedAddress(null);
    }
  }, [addressOption, userData]);

  const calculateCartTotals = () => {
    if (!cart || !cart.products)
      return { total: 0, finalTotal: 0, discount: 0 };

    let total = 0;
    let finalTotal = 0;
    let discount = 0;

    cart.products.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      const quantity = item.itemQuantity;
      const unitPrice = product?.discountPrice || item.ItemsPrice / quantity;
      const originalPrice = product?.price || unitPrice;

      total += originalPrice * quantity;
      finalTotal += unitPrice * quantity;
    });

    discount = total - finalTotal;
    
    return { total, finalTotal, discount };
  };

  const { finalTotal: subtotal, discount } = calculateCartTotals();
  const deliveryCharges = 24.0;
  const vat = subtotal * 0.14; // Calculate VAT for display only
  const finalTotal = subtotal + vat + deliveryCharges; // finalTotal includes VAT and delivery

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (addressOption === "new") {
      if (!formData.street) errors.street = "Street address is required";
      if (!formData.country) errors.country = "Country is required";
      if (!formData.regionState)
        errors.regionState = "Region/State is required";
      if (!formData.city) errors.city = "City is required";
      if (!formData.postalCode) errors.postalCode = "Postal code is required";
    } else if (addressOption === "existing" && selectedAddress === null) {
      errors.address = "Please select an existing address";
    }
    if (!selectedPaymentMethod)
      errors.paymentMethod = "Please select a payment method";
    return errors;
  };

  const createOrder = async (
    shippingAddress,
    paymentMethod,
    paypalOrderId = null
  ) => {
    const orderRef = doc(collection(db, "orders"));
    const orderData = {
      couponCode: null,
      createdAt: new Date(),
      discount,
      finalTotal: parseFloat((subtotal + vat + deliveryCharges).toFixed(2)), // Round to 2 decimal places
      deliveryCharges,
      total: subtotal, // Just the subtotal without VAT or delivery
      orderId: orderRef.id,
      paymentMethod,
      paypalOrderId,
      products: cart.products.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        
        const quantity = item.itemQuantity || 1;
        const itemPrice = item.ItemsPrice || 0;
        const calculatedUnitPrice = itemPrice / quantity;
        const finalUnitPrice = product?.discountPrice || calculatedUnitPrice;

        return {
          productId: item.productId,
          variantId: item.variantId || null,
          itemQuantity: item.itemQuantity,
          quantity: item.itemQuantity,
          price: finalUnitPrice,
          sku: product?.sku || "",
          variantAttributes:
            item.variantAttributes && typeof item.variantAttributes === "object"
              ? Object.entries(item.variantAttributes).map(([key, value]) => ({
                  key,
                  value,
                }))
              : null,
        };
      }),
      shippingAddress,
      status: paymentMethod === "cod" ? "pending" : "delivered",
      updatedAt: new Date(),
      userId: user.uid,
    };
    await setDoc(orderRef, orderData);
    return orderData;
  };

  const clearCart = async () => {
    const q = query(collection(db, "Cart"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const cartDoc = querySnapshot.docs[0];
      const cartRef = doc(db, "Cart", cartDoc.id);
      await updateDoc(cartRef, {
        products: [],
        updatedAt: new Date().toISOString(),
      });

      const updatedCartDoc = await getDoc(cartRef, { source: "server" });

      if (
        updatedCartDoc.exists() &&
        updatedCartDoc.data().products?.length !== 0
      ) {
        throw new Error("Failed to clear cart products");
      }
    } else {
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
      const userRef = doc(db, "users", user.uid);
      const newAddress = {
        street: formData.street,
        country:
          countries.find((c) => c.isoCode === formData.country)?.name ||
          formData.country,
        regionState:
          states.find((s) => s.isoCode === formData.regionState)?.name ||
          formData.regionState,
        city: formData.city,
        postalCode: formData.postalCode,
      };
      await updateDoc(userRef, {
        address: arrayUnion(newAddress),
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

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.log("Validation failed:", errors);
      return;
    }

    if (!cart || !cart.products || cart.products.length === 0) {
      setFormErrors({
        submit: "Cart is empty. Please add products to proceed.",
      });
      console.log("Cart is empty");
      return;
    }

    setIsSubmitting(true);
    let orderId = null;
    try {
      console.log("Starting order processing for userId:", user.uid);
      if (!navigator.onLine) {
        throw new Error(
          "You are offline. Please connect to the internet and try again."
        );
      }

      let shippingAddress = {};
      if (addressOption === "existing" && selectedAddress !== null) {
        const address = userData.address[selectedAddress];
        shippingAddress = {
          address: address.street,
          city: address.city,
          country: address.country,
          name: userData.fullName || "Unknown User",
          phone: userData.phone || "",
          postalCode: address.postalCode,
        };
        console.log(
          "Using existing address:",
          JSON.stringify(shippingAddress, null, 2)
        );
      } else {
        const newAddress = {
          street: formData.street,
          country:
            countries.find((c) => c.isoCode === formData.country)?.name ||
            formData.country,
          regionState:
            states.find((s) => s.isoCode === formData.regionState)?.name ||
            formData.regionState,
          city: formData.city,
          postalCode: formData.postalCode,
        };
        const userRef = doc(db, "users", user.uid);
        console.log("Saving new address:", JSON.stringify(newAddress, null, 2));
        await updateDoc(userRef, {
          address: arrayUnion(newAddress),
        });
        shippingAddress = {
          address: newAddress.street,
          city: newAddress.city,
          country: newAddress.country,
          name: userData.fullName || "Unknown User",
          phone: userData.phone || "",
          postalCode: newAddress.postalCode,
        };
      }

      if (selectedPaymentMethod === "cod") {
        const createdOrderData = await createOrder(shippingAddress, "cod");
        orderId = createdOrderData.orderId;

        // Decrement stock after successful order creation for COD
        if (orderId && createdOrderData) {
          try {
            console.log("CALLING decrementStock FUNCTION");
            console.log(
              "Products to decrement:",
              JSON.stringify(createdOrderData.products, null, 2)
            );
            const result = await decrementStock(createdOrderData.products);
            console.log(`Stock decremented for order ${orderId}:`, result);
            
            // إضافة استدعاء incrementSoldCount لكل منتج
            console.log("CALLING incrementSoldCount FUNCTION");
            for (const item of createdOrderData.products) {
              const quantity = item.itemQuantity || item.quantity || 1;
              await incrementSoldCount(item.productId, quantity);
              console.log(`Sold count incremented for product ${item.productId} by ${quantity}`);
            }
          } catch (stockError) {
            console.error(
              `Failed to update product stats for order ${orderId}:`,
              stockError
            );
          }
        }

        await clearCart();
        dispatch(fetchUserData(user.uid));
        dispatch(fetchCart(user.uid));
        navigate("/order-confirmation", { state: { orderId } });
      } else {
        console.log("Waiting for PayPal payment approval...");
      }
    } catch (error) {
      console.error("Error processing order:", error);
      setFormErrors({
        submit: `Failed to process order: ${error.message || "Unknown error"}`,
      });
    } finally {
      if (selectedPaymentMethod === "cod") {
        setIsSubmitting(false);
      }
    }
  };

  const paymentMethods = [
    { label: "Cash On Delivery", value: "cod" },
    { label: "PayPal", value: "paypal" },
  ];

  if (cartLoading || userLoading || productsLoading) {
    return (
      <Container fluid className="py-4 bg-white">
        <div>{t("common.loading")}</div>
      </Container>
    );
  }

  if (cartError || userError || productsError) {
    return (
      <Container fluid className="py-4 bg-white">
        <div>Error: {cartError || userError || productsError}</div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container fluid className="py-4 bg-white">
        <div>{t("checkout.loginRequired")}</div>
      </Container>
    );
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <Container fluid className="py-4 bg-white">
        <div>{t("cart.empty")}</div>
      </Container>
    );
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
                    <h3 className="mb-4 text-secondary fw-normal">
                      {t("checkout.orderSummary")}
                    </h3>
                    <ListGroup variant="flush">
                      {cart?.products?.map((item) => (
                        <ListGroup.Item
                          key={item.productId + (item.variantId || "")}
                        >
                          <Row className="align-items-center">
                            <Col xs={2}>
                              <Image
                                src={
                                  item.mainImage ||
                                  products?.find((p) => p.id === item.productId)
                                    ?.mainImage ||
                                  "https://via.placeholder.com/40"
                                }
                                fluid
                                rounded
                              />
                            </Col>
                            <Col xs={7}>
                              <div className="mb-0">
                                {item.title?.[currentLanguage] ||
                                  item.title?.en ||
                                  products?.find((p) => p.id === item.productId)
                                    ?.title?.[currentLanguage] ||
                                  products?.find((p) => p.id === item.productId)
                                    ?.title?.en ||
                                  "Product Name"}
                                {item.variantAttributes &&
                                  Object.keys(item.variantAttributes).length >
                                    0 && (
                                    <small className="text-muted ms-2">
                                      (
                                      {Object.entries(item.variantAttributes)
                                        .map(
                                          ([key, value]) =>
                                            `${t(key)}: ${value}`
                                        )
                                        .join(", ")}
                                      )
                                    </small>
                                  )}
                              </div>
                              <div className="text-muted small">
                                {t("cart.quantity")}: {item.itemQuantity}
                              </div>
                            </Col>
                            <Col xs={3} className="text-end">
                              ${item.price?.toFixed(2)}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                    <hr />
                    <div className="d-flex justify-content-between mt-3">
                      <span>{t("common.subtotal")}</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <span>{t("common.vat")}</span>
                      <span>${vat.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <span>{t("cart.deliveryCharges")}</span>
                      <span>${deliveryCharges.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-3 mb-4 pt-3">
                      <h5 className="fw-normal">{t("common.totalAmount")}</h5>
                      <h5 className="fw-bold">${finalTotal.toFixed(2)}</h5>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="shadow-sm rounded-4">
                  <Card.Body>
                    <h5 className="fw-bold">{t("checkout.paymentMethod")}</h5>
                    <p className="text-muted">
                      {t("checkout.paymentMethodDescription")}
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
                        <div className="text-danger mb-2">
                          {formErrors.paymentMethod}
                        </div>
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
                                      value: finalTotal.toFixed(2),
                                    },
                                  },
                                ],
                              });
                            }}
                            onApprove={async (data, actions) => {
                              try {
                                setIsSubmitting(true);
                                const details = await actions.order.capture();
                                console.log(
                                  "PayPal payment captured:",
                                  JSON.stringify(details, null, 2)
                                );

                                let shippingAddress = {};
                                if (
                                  addressOption === "existing" &&
                                  selectedAddress !== null
                                ) {
                                  const address =
                                    userData.address[selectedAddress];
                                  shippingAddress = {
                                    address: address.street,
                                    city: address.city,
                                    country: address.country,
                                    name: userData.fullName || "Unknown User",
                                    phone: userData.phone || "",
                                    postalCode: address.postalCode,
                                  };
                                } else {
                                  const newAddress = {
                                    street: formData.street,
                                    country:
                                      countries.find(
                                        (c) => c.isoCode === formData.country
                                      )?.name || formData.country,
                                    regionState:
                                      states.find(
                                        (s) =>
                                          s.isoCode === formData.regionState
                                      )?.name || formData.regionState,
                                    city: formData.city,
                                    postalCode: formData.postalCode,
                                  };
                                  const userRef = doc(db, "users", user.uid);
                                  await updateDoc(userRef, {
                                    address: arrayUnion(newAddress),
                                  });
                                  shippingAddress = {
                                    address: newAddress.street,
                                    city: newAddress.city,
                                    country: newAddress.country,
                                    name: userData.fullName || "Unknown User",
                                    phone: userData.phone || "",
                                    postalCode: newAddress.postalCode,
                                  };
                                }

                                const createdOrderData = await createOrder(
                                  shippingAddress,
                                  "paypal",
                                  details.id
                                );

                                // إضافة استدعاء incrementSoldCount لكل منتج
                                console.log("CALLING incrementSoldCount FUNCTION for PayPal order");
                                for (const item of createdOrderData.products) {
                                  const quantity = item.itemQuantity || item.quantity || 1;
                                  await incrementSoldCount(item.productId, quantity);
                                  console.log(`Sold count incremented for product ${item.productId} by ${quantity}`);
                                }

                                await clearCart();
                                dispatch(fetchUserData(user.uid));
                                dispatch(fetchCart(user.uid));
                                navigate("/order-confirmation", {
                                  state: { orderId: createdOrderData.orderId },
                                });
                              } catch (error) {
                                console.error(
                                  "Error capturing PayPal payment:",
                                  error
                                );
                                setFormErrors({
                                  submit: `Failed to process PayPal payment: ${error.message}`,
                                });
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            onError={(err) => {
                              console.error("PayPal Buttons error:", err);
                              setFormErrors({
                                submit:
                                  "An error occurred with PayPal. Please try again.",
                              });
                              setIsSubmitting(false);
                            }}
                          />
                        </div>
                      )}
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={7}>
                <Card className="border-0 mb-4 shadow-sm rounded-4">
                  <Card.Body>
                    <h3 className="mb-4 text-secondary fw-normal">
                      {t("checkout.billingDetails")}
                    </h3>
                    <h5 className="mb-3 text-secondary">
                      {t("checkout.checkoutOptions")}
                    </h5>

                    <Form
                      onSubmit={
                        addressOption === "new"
                          ? handleAddAddress
                          : handleSubmit
                      }
                    >
                      <div className="mb-4">
                        <Form.Check
                          inline
                          type="radio"
                          id="existing-address"
                          name="addressOption"
                          label={t("checkout.existingAddress")}
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
                          label={t("checkout.newAddress")}
                          checked={addressOption === "new"}
                          onChange={() => setAddressOption("new")}
                        />
                      </div>

                      {formErrors.submit && (
                        <Alert variant="danger" className="mb-3">
                          {formErrors.submit}
                        </Alert>
                      )}
                      {formErrors.address && (
                        <Alert variant="danger" className="mb-3">
                          {formErrors.address}
                        </Alert>
                      )}

                      {addressOption === "existing" &&
                      userData?.address?.length > 0 ? (
                        <div className="mb-4">
                          <h6>{t("checkout.selectAddress")}</h6>
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
                                      <p className="fw-bold">
                                        {t("checkout.name")}:{" "}
                                      </p>{" "}
                                      <p> {userData.fullName}</p>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">
                                        {t("checkout.address")}:{" "}
                                      </p>
                                      <p> {address.street} </p>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">
                                        {t("checkout.postalCode")}:{" "}
                                      </p>
                                      <p>{address.postalCode}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">
                                        {t("checkout.country")}:{" "}
                                      </p>
                                      <p>{address.country}</p>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">
                                        {t("checkout.state")}:
                                      </p>
                                      <p>{address.regionState}</p>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <p className="fw-bold">
                                        {t("checkout.city")}:{" "}
                                      </p>
                                      <p>{address.city}</p>
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      ) : addressOption === "existing" ? (
                        <div className="text-muted mb-4">
                          {t("checkout.noSavedAddresses")}
                        </div>
                      ) : (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>{t("checkout.address")}</Form.Label>
                            <Form.Control
                              type="text"
                              name="street"
                              value={formData.street}
                              onChange={handleInputChange}
                              placeholder={t("checkout.addressPlaceholder")}
                              isInvalid={!!formErrors.street}
                            />
                            <Form.Control.Feedback type="invalid">
                              {formErrors.street}
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>{t("checkout.country")}</Form.Label>
                                <Form.Control
                                  as="select"
                                  name="country"
                                  value={formData.country}
                                  onChange={(e) => {
                                    setSelectedCountry(e.target.value);
                                    setSelectedState("");
                                    setFormData({
                                      ...formData,
                                      country: e.target.value,
                                    });
                                    handleInputChange(e);
                                  }}
                                  isInvalid={!!formErrors.country}
                                >
                                  <option value="">
                                    {t("checkout.selectCountry")}
                                  </option>
                                  {countries.map((country) => (
                                    <option
                                      key={country.isoCode}
                                      value={country.isoCode}
                                    >
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
                                <Form.Label>
                                  {t("checkout.regionState")}
                                </Form.Label>
                                <Form.Control
                                  as="select"
                                  name="regionState"
                                  value={formData.regionState}
                                  onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setFormData({
                                      ...formData,
                                      regionState: e.target.value,
                                    });
                                    handleInputChange(e);
                                  }}
                                  disabled={!selectedCountry}
                                  isInvalid={!!formErrors.regionState}
                                >
                                  <option value="">
                                    {t("checkout.selectState")}
                                  </option>
                                  {states.map((state) => (
                                    <option
                                      key={state.isoCode}
                                      value={state.isoCode}
                                    >
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
                                <Form.Label>{t("checkout.city")}</Form.Label>
                                <Form.Control
                                  as="select"
                                  name="city"
                                  value={formData.city}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      city: e.target.value,
                                    });
                                    handleInputChange(e);
                                  }}
                                  disabled={!cities.length}
                                  isInvalid={!!formErrors.city}
                                >
                                  <option value="">
                                    {t("checkout.selectCity")}
                                  </option>
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
                                <Form.Label>
                                  {t("checkout.postalCode")}
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="postalCode"
                                  value={formData.postalCode}
                                  onChange={handleInputChange}
                                  placeholder={t(
                                    "checkout.postalCodePlaceholder"
                                  )}
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
                            {isSubmitting
                              ? t("checkout.adding")
                              : t("checkout.addAddress")}
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            type="submit"
                            className="px-4 py-2"
                            disabled={
                              isSubmitting ||
                              selectedPaymentMethod === "paypal" ||
                              selectedAddress === null
                            }
                          >
                            {isSubmitting
                              ? t("checkout.processing")
                              : t("checkout.placeOrder")}
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
            <span
              key={i}
              style={{
                color: i < rating ? "#f0ad4e" : "#ccc",
                fontSize: "14px",
              }}
            >
              ★
            </span>
          ))}
        </div>
        <div>
          {originalPrice && (
            <span className="text-decoration-line-through text-muted me-2">
              {originalPrice}
            </span>
          )}
          <span className="fw-bold">{discountedPrice}</span>
        </div>
      </div>
    </div>
  );
}
