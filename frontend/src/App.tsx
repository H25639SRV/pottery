import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Home from "./pages/Home";
import Login from "./components/Login";
import Cart from "./components/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <NavBar /> {/* Navbar ở đây -> chỉ có 1 lần */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
        <Footer />
      </Router>
    </AppProvider>
  );
};

export default App;
