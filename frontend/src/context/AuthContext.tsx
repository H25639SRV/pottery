import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  role: string | null;
  email: string | null;
  username: string | null;
  login: (data: any) => void;
  logout: () => void;
  loading: boolean; // ✅ thêm vào để biết khi nào context load xong
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  email: null,
  username: null,
  login: () => {},
  logout: () => {},
  loading: true, // ✅ mặc định đang tải
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ thêm trạng thái loading

  const login = (data: any) => {
    setToken(data.token);
    setRole(data.role);
    setEmail(data.email);
    setUsername(data.username);

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("email", data.email);
    localStorage.setItem("username", data.username);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setEmail(null);
    setUsername(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
  };

  useEffect(() => {
    // đảm bảo đồng bộ khi reload
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");
    const storedUsername = localStorage.getItem("username");

    setToken(storedToken);
    setRole(storedRole);
    setEmail(storedEmail);
    setUsername(storedUsername);
    setLoading(false); // ✅ đánh dấu đã load xong
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, role, email, username, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
