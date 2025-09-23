import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

const Login: React.FC = () => {
  const { login, logout, user } = useAppContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Giả sử gọi API thành công -> nhận được token
    const fakeToken = "jwt-token-demo";
    login(fakeToken, username);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Xin chào, {user.username}</p>
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
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Đăng nhập</button>
        </div>
      )}
    </div>
  );
};

export default Login;
