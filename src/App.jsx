import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
import Header from "./component/Header/Header"
import Footer from "./component/Footer/Footer";
import Register from "./component/Register/Register";
import Login from "./component/Login/Login";
// import ForgetPassword from "./component/ForgetPassword/ForgetPassword";
import ForgetPassword from "./component/Forget_Password/Forget_password";


function App() {
  return (
    <>
      <Header />
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/Register" element={<Register />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/ForgetPassword" element={<ForgetPassword/>} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;
