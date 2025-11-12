// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";
import { getApiUrl } from "../config/apiConfig";

// Khai báo biến môi trường API
const API_URL = process.env.REACT_APP_API_URL;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (!API_URL) {
      console.error("Lỗi: REACT_APP_API_URL chưa được cấu hình!");
      alert("Lỗi cấu hình API. Vui lòng liên hệ quản trị viên.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Đăng nhập thất bại!");
        return;
      }

      login({ token: data.token, user: data.user });
      alert(`Xin chào ${data.user.username}!`);
      navigate("/");
    } catch (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      alert("Đã xảy ra lỗi, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fade-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="auth-page"
        style={{
          backgroundImage: "url('/image/loginbackground.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="overlay"></div>
        <div className="auth-container">
          <h2 className="auth-title">Đăng nhập</h2>

          <input
            type="email"
            placeholder="Địa chỉ email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
