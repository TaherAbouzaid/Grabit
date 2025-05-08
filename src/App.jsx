import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./componant/Cart/Cart";
import Wishlist from "./componant/Wishlist/Wishlist";
import Header from "./componant/Header/Header";
import Footer from "./componant/Footer/Footer";


function App() {
  return (
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Cart" element={<Cart/>}/>
        <Route path="/Wishlist" element={<Wishlist/>}/>
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;
