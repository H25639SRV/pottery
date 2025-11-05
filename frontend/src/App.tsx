import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Privacy from "./pages/Privacy";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminProductPage from "./pages/AdminProductPage";
import AdminRoute from "./components/AdminRoute";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import TryPatternPage from "./pages/TryPatternPage";
import ChatWidget from "./components/Chat/ChatWidget";
const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/render" element={<TryPatternPage />} />
          <Route
            path="/admin/edit"
            element={
              <AdminRoute>
                <AdminProductPage />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
      <ChatWidget />
    </>
  );
};

export default App;
