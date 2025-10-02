// src/components/Login.tsx
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

const Login: React.FC = () => {
  const { login, user, logout } = useAppContext();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (username && email) {
      login(username, email);
    }
  };

  return (
    <div className="login-page">
      {user ? (
        <div>
          <p>
            Xin chào, {user.username} ({user.email})
          </p>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleLogin}>Đăng nhập</button>
        </div>
      )}
    </div>
  );
};

export default Login;
