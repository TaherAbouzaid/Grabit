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
  loadLocalWishlist,
  removeFromLocalWishlist,
  removeFromWishlist,
} from "../../store/Slices/wishlistSlice";
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
  useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // ✅ تحميل wishlist من localStorage أو Firestore
  useEffect(() => {
    if (user) {
      dispatch(fetchUserWishlist(user.uid));
    } else {
      dispatch(loadLocalWishlist());
    }
  }, [user, dispatch]);

  // ✅ عرض toast إذا كان المنتج موجود بالفعل
  useEffect(() => {
    if (error === "Product already in wishlist") {
      showToast("Product is already in your wishlist!", "warning");
    }
  }, [error]);

  // ✅ إزالة منتج من الـ wishlist
  const handleRemoveItem = (productId) => {
    if (user) {
      dispatch(removeFromWishlist({ productId, userId: user.uid }));
    } else {
      dispatch(removeFromLocalWishlist(productId));
    }
  };

  // ✅ إضافة منتج إلى الـ cart
  const handleAddToCart = (item) => {
    if (cartLoading) return;

    dispatch(
      addToCart({
        userId: user?.uid || null,
        productId: item.id,
        price: item.price,
      })
    );

    showToast(
      currentLanguage === "ar"
        ? "تمت إضافة المنتج إلى السلة!"
        : "Product added to cart!",
      "success"
    );
  };

  return (
    <Container fluid className="p-4">
      <div className="nav d-flex justify-content-between p-3">
        <p>{t("wishlist.wishlist")}</p>
        {/* <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item active style={{ color: "#5caf90" }}>{t('wishlist.wishlist')}</Breadcrumb.Item>
        </Breadcrumb> */}
      </div>

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
              <Button variant="success">{t("wishlist.shopNow")}</Button>
            </div>

            <Table responsive hover className="wishlist-table">
              <thead>
                <tr>
                  <th>{t("wishlist.image")}</th>
                  <th className="w-50">{t("wishlist.name")}</th>
                  <th>{t("wishlist.price")}</th>
                  {/* <th>{t('wishlist.status')}</th> */}
                  <th>{t("wishlist.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.length > 0 ? (
                  wishlistItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Image src={item.mainImage} width="50" />
                      </td>
                      <td>{item.title?.[currentLanguage]}</td>
                      <td>${item.price}</td>
                      {/* <td className="text-success">Available</td> */}
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
                    <td colSpan="5" className="text-center text-muted">
                      {t("wishlist.empty")}{" "}
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
