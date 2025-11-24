import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// 🔑 KHAI BÁO BIẾN MÔI TRƯỜNG API URL
const API_URL = process.env.REACT_APP_API_URL || "";

const Login: React.FC = () => {
  // ✅ SỬA 1: Lấy 'user' object thay vì lấy lẻ tẻ username/email
  const { login, logout, user } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);

      // Định nghĩa kiểu dữ liệu trả về để Typescript hiểu
      const data = res.data as {
        token: string;
        user: { id: number; username: string; email: string; role: string };
      };

      if (!data.user || !data.token) {
        alert("Đăng nhập thất bại! Dữ liệu không hợp lệ.");
        return;
      }

      // ✅ SỬA 2: Gọi hàm login với 2 tham số riêng biệt (token, user)
      login(data.token, data.user);

      alert("Đăng nhập thành công!");
    } catch (err: any) {
      console.error("❌ Lỗi đăng nhập:", err.response?.data || err.message);
      alert("Đăng nhập thất bại!");
    }
  };

  return (
    <div className="login-page">
      {/* ✅ SỬA 3: Kiểm tra object 'user' */}
      {user ? (
        <div>
          <p>
            {/* Truy cập thuộc tính bên trong object user */}
            Xin chào, <strong>{user.username}</strong> ({user.email})
          </p>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      ) : (
        <div className="login-form">
          <h2>Đăng nhập</h2>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
          />

          <button onClick={handleLogin}>Đăng nhập</button>
        </div>
      )}
    </div>
  );
};

export default Login;
