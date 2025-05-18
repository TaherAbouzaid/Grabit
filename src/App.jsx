// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import Cart from "./componant/Cart/Cart";
// import Wishlist from "./componant/Wishlist/Wishlist";
// import Header from "./componant/Header/Header";
// import Footer from "./componant/Footer/Footer";
// import Register from "./componant/Register/Register";
// import Login from "./componant/Login/Login";
// import ForgetPassword from "./componant/Forget_password/Forget_password";
// import Checkout from "./componant/Checkout/Checkout";
// import ProductPage from "./componant/Products/Products";
// import CategoryPage from "./componant/CategoryPage/CategoryPage";
// import UserProfile from "./componant/UserProfile/UserProfile";
// import EditProfile from "./componant/EditProfile/EditProfile";
// import OrderTracker from "./componant/OrderTracker/OrderTracker";
// import { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { fetchCategoriesWithSub } from "./Store/Slices/categorySlicees";
// import OrderConfirmation from "./componant/Checkout/OrderConfirmation";



// function App() {

//    const dispatch = useDispatch(); 

//   useEffect(() => {
//     dispatch(fetchCategoriesWithSub());
//      },[dispatch]);
  
//   return (
//     <BrowserRouter>
//     <Header/>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/Cart" element={<Cart/>}/>
//         <Route path="/Wishlist" element={<Wishlist/>}/>
//         <Route path="/register" element={<Register/>}/>
//         <Route path="/login" element={<Login/>}/>
//         <Route path="/ForgetPassword" element={<ForgetPassword/>}/>
//         <Route path="/checkout" element={ <Checkout />}/>
        

//         <Route path="/Products" element={<ProductPage/>}/>
//         <Route path="/category/:categoryId" element={<CategoryPage />} />
//         <Route path="/profile" element={<UserProfile />} />
//         <Route path="/edit-profile" element={<EditProfile />} />
//         <Route path="/order-confirmation" element={<OrderConfirmation />} />
        

//         <Route path="/products/:categorySlug" element={<ProductPage />} />
//         <Route path="/products/:categorySlug/:subcategorySlug" element={<ProductPage />} />
//         {/* <Route path="/category/:categoryId" element={<CategoryPage />} /> */}
//         {/* <Route path="/Account_Order" element={<Account_Order />} /> */}
//         <Route path="/OrderTracker" element={<OrderTracker/>}/>




//       </Routes>
//       <Footer/>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";

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

import { useDispatch } from 'react-redux';
import { fetchCategoriesWithSub } from "./Store/Slices/categorySlicees";
import OrderConfirmation from "./componant/Checkout/OrderConfirmation";
import MegaMenuProduct from "./componant/MegaMenuProduct/MegaMenuProduct";
import ChangePassword from "./componant/ChangePassward/ChangePassward";
import OrderList from "./componant/UserOrder/UserOrder";
import ContactPage from "./componant/ContactUs/ContactUs";
import OrdersTable from "./componant/UserHistory/UserHistory";

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
     },[dispatch]);
  
  return (
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:productId" element={<ProductPage />} />
        <Route path="/MegaMenuProduct" element={<MegaMenuProduct/>}/>
        <Route path="/Cart" element={<Cart/>}/>
        <Route path="/Wishlist" element={<Wishlist/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/ForgetPassword" element={<ForgetPassword/>}/>
        <Route path="/checkout" element={ <Checkout />}/>
        <Route path="/ChangePassword" element={<ChangePassword />} />
        

        <Route path="/Products" element={<ProductPage/>}/>
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/ContactPage" element={<ContactPage />} />
        <Route path="/userHistory" element={<OrdersTable />} />
        

        <Route path="/products/:categorySlug" element={<ProductPage />} />
        <Route path="/products/:categorySlug/:subcategorySlug" element={<ProductPage />} />
        <Route path="/OrderTracker" element={<OrderTracker/>}/>
        <Route path="/OrderList" element={<OrderList />} />





      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;
