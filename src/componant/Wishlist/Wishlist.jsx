import React, { useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Row,
  Col,
  Image,
  Breadcrumb,
} from "react-bootstrap";
import { IoCloseSharp } from "react-icons/io5";
import { GiGymBag } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../components/SimpleToastUtils";
import "./Wishlist.css";
import {
  fetchUserWishlist,
  removeFromWishlist,
} from "../../Store/Slices/wishlistSlice";
import { addToCart } from "../../Store/Slices/cartSlice";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items: wishlistItems, error } = useSelector(
    (state) => state.wishlist
  );
  const { loading: cartLoading } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // تحميل wishlist من users collection
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserWishlist(user.uid));
    }
  }, [user, dispatch]);

  // عرض toast إذا كان المنتج موجود بالفعل
  useEffect(() => {
    if (error === "Product already in wishlist") {
      showToast(t("wishlist.alreadyInWishlist"), "warning");
    }
  }, [error, t]);

  // إزالة منتج من الـ wishlist
  const handleRemoveItem = (productId) => {
    if (user?.uid) {
      dispatch(removeFromWishlist({ productId, userId: user.uid }));
    }
  };

  // إضافة منتج إلى الـ cart
  const handleAddToCart = (item) => {
    if (cartLoading || !user?.uid) return;

    const cartItem = {
      userId: user.uid,
      productId: item.id,
      title: item.title,
      mainImage: item.imageUrl,
      price: item.price,
      quantity: 1, // Default quantity
      productType: "simple", // Assuming simple product for wishlist items
    };

    dispatch(addToCart(cartItem));

    showToast(
      currentLanguage === "ar"
        ? "تمت إضافة المنتج إلى السلة!"
        : "Product added to cart!",
      "success"
    );
  };

  return (
    <Container fluid className="p-4">
      <Row className="wishlist-header">
        <Col>
          <h2 className="text-center fw-bold mt-4">{t("wishlist.wishlist")}</h2>
          <p className="text-center text-muted">{t("wishlist.title")}</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="wishlist-card border rounded p-3 bg-white shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">{t("wishlist.wishlist")}</h5>
              <Button onClick={() => navigate("/shop")} variant="success">
                {t("wishlist.shopNow")}
              </Button>
            </div>

            <Table responsive hover className="wishlist-table">
              <thead>
                <tr>
                  <th>{t("wishlist.image")}</th>
                  <th className="w-50">{t("wishlist.name")}</th>
                  <th>{t("wishlist.price")}</th>
                  <th>{t("wishlist.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.length > 0 ? (
                  wishlistItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Image src={item.imageUrl} width="50" alt={item.title[currentLanguage]} />
                      </td>
                      <td>{item.title[currentLanguage]}</td>
                      <td>${item.price}</td>
                      <td>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleAddToCart(item)}
                        >
                          <GiGymBag />
                        </Button>
                        <Button
                          variant="dark"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <IoCloseSharp className="Color-white" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      {t("wishlist.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Wishlist;