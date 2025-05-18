import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:productId" element={<ProductPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
