import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Home from "./pages/Home";
import Login from "./components/Login";
import Cart from "./components/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <nav style={{ padding: 12 }}>
          <Link to="/" style={{ marginRight: 8 }}>
            Home
          </Link>
          <Link to="/login" style={{ marginRight: 8 }}>
            Login
          </Link>
          <Link to="/cart" style={{ marginRight: 8 }}>
            Cart
          </Link>
          <Link to="/checkout" style={{ marginRight: 8 }}>
            Checkout
          </Link>
          <Link to="/orders">Orders</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
