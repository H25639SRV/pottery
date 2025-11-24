import React, { useState } from "react";
import { motion } from "framer-motion"; // 👈 Thêm framer-motion
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 👈 Thêm AuthContext
import "../styles/Auth.css"; // 👈 Sử dụng Auth.css

// 🔑 KHAI BÁO BIẾN MÔI TRƯỜNG API URL
const API_URL = process.env.REACT_APP_API_URL || "";

const LoginPage: React.FC = () => {
  // --- STATE ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- CONTEXT & ROUTING ---
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();

  // --- HANDLER ---
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);

      // ✅ Đổi endpoint thành /api/auth/login
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Gọi hàm login từ AuthContext
        login(data.token, data.user);

        alert("Đăng nhập thành công!");
        navigate("/"); // Chuyển hướng về trang chủ
      } else {
        alert(
          data.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu!"
        );
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      alert("Đã xảy ra lỗi kết nối, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // --- TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP (Giữ lại logic cũ) ---
  if (user) {
    return (
      <div
        className="auth-page"
        style={{ padding: "50px", textAlign: "center" }}
      >
        <h2 className="auth-title">Bạn đã đăng nhập</h2>
        <p>
          Xin chào, <strong>{user.username}</strong> ({user.email})
        </p>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="auth-btn"
          style={{ width: "200px", marginTop: "15px" }}
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
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

          {/* Input Email */}
          <input
            type="email"
            placeholder="Địa chỉ email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Input Mật khẩu */}
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
