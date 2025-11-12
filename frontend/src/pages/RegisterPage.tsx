import React, { useState } from "react";

import { motion } from "framer-motion";

import { Link, useNavigate } from "react-router-dom";

import "../styles/Auth.css";

// 🔑 KHAI BÁO BIẾN MÔI TRƯỜNG API URL

const API_URL = process.env.REACT_APP_API_URL || "";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [username, setUsername] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      alert("Vui lòng nhập đầy đủ thông tin!");

      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");

      return;
    }

    try {
      setLoading(true);

      // ✅ Sửa lỗi đường dẫn: Dùng API_URL

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          email,

          password,

          username,

          role: "USER", // ✅ mặc định đăng ký là USER
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Đăng ký thất bại!");

        return;
      }

      alert("Đăng ký thành công!");

      // ✅ Sau khi đăng ký thành công: chuyển hướng sang login

      navigate("/login");

      // hoặc: navigate("/"); // nếu muốn về trang chủ luôn
    } catch (err) {
      console.error("Lỗi đăng ký:", err);

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
          <h2 className="auth-title">Đăng ký tài khoản</h2>

          <input
            type="text"
            placeholder="Tên người dùng"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

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

          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            className="auth-btn"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <p className="auth-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
