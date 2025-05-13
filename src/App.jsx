import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./componant/Cart/Cart";
import Wishlist from "./componant/Wishlist/Wishlist";
import Header from "./componant/Header/Header";
import Footer from "./componant/Footer/Footer";
import Register from "./componant/Register/Register";
import Login from "./componant/Login/Login";
import ForgetPassword from "./componant/Forget_password/Forget_password";
import ProtectedRoute from "./componant/ProtectedRoute/ProtectedRoute";
import Checkout from "./componant/Checkout/Checkout";
import ProductPage from "./componant/Products/Products";
import CategoryPage from "./componant/CategoryPage/CategoryPage";


function App() {
  return (
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Cart" element={<Cart/>}/>
        <Route path="/Wishlist" element={<Wishlist/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/ForgetPassword" element={<ForgetPassword/>}/>
        <Route path="/checkout" element={ <ProtectedRoute> <Checkout /></ProtectedRoute> }/>
        <Route path="/Products" element={<ProductPage/>}/>
        <Route path="/category/:categoryId" element={<CategoryPage />} />




      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;
