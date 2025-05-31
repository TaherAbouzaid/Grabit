import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import ChatbotButton from "./componant/AIChat/ChatbotButton";

import Cart from "./componant/Cart/Cart";
import Wishlist from "./componant/Wishlist/Wishlist";
import Header from "./componant/Header/Header";
import Footer from "./componant/Footer/Footer";
import Register from "./componant/Register/Register";
import Login from "./componant/Login/Login";
import ForgetPassword from "./componant/Forget_password/Forget_password";
import Checkout from "./componant/Checkout/Checkout";
import CategoryPage from "./componant/CategoryPage/CategoryPage";
import UserProfile from "./componant/UserProfile/UserProfile";
import EditProfile from "./componant/EditProfile/EditProfile";
import OrderTracker from "./componant/OrderTracker/OrderTracker";

import { useDispatch } from "react-redux";
import { fetchCategoriesWithSub } from "./Store/Slices/categorySlicees";
import OrderConfirmation from "./componant/Checkout/OrderConfirmation";
import MegaMenuProduct from "./componant/MegaMenuProduct/MegaMenuProduct";
import ChangePassword from "./componant/ChangePassward/ChangePassward";
import OrderList from "./componant/UserOrder/UserOrder";
import ContactPage from "./componant/ContactUs/ContactUs";
import OrdersTable from "./componant/UserHistory/UserHistory";
import OffersPage from "./pages/OffersPage";
import BlogContent from "./componant/BlogContent/BlogContent";
import BlogPage from "./componant/BlogPage/BlogPage";
import AboutUs from "./componant/AboutUs/AboutUs";
import SearchResults from "./componant/SearchResults/SearchResults";
import "./i18n"; // تأكد من أن هذا هو الملف الصحيح

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    return () => {
      AOS.refresh();
    };
  }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCategoriesWithSub());
  }, [dispatch]);

  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:productId" element={<ProductPage />} />
                <Route path="/MegaMenuProduct" element={<MegaMenuProduct />} />
                <Route path="/Cart" element={<Cart />} />
                <Route path="/Wishlist" element={<Wishlist />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/ForgetPassword" element={<ForgetPassword />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/ChangePassword" element={<ChangePassword />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route
                  path="/order-confirmation"
                  element={<OrderConfirmation />}
                />
                <Route path="/ContactPage" element={<ContactPage />} />
                <Route path="/userHistory" element={<OrdersTable />} />
                <Route path="/OrderTracker" element={<OrderTracker />} />
                <Route path="/OrderList" element={<OrderList />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route
                  path="/category/:categoryId"
                  element={<CategoryPage />}
                />
                <Route
                  path="/category/:categoryId/:subCategoryId"
                  element={<CategoryPage />}
                />
                <Route
                  path="/category/:categoryId/:subCategoryId/:subSubCategoryId"
                  element={<CategoryPage />}
                />
                <Route path="/category" element={<CategoryPage />} />
                <Route path="/BlogPage" element={<BlogPage />} />
                <Route path="/BlogPage/:postId" element={<BlogContent />} />
                <Route path="/AboutUs" element={<AboutUs />} />
                <Route path="/search" element={<SearchResults />} />
              </Routes>
            </main>
            <Footer />
            <ChatbotButton />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
