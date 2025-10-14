// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

interface AuthState {
  token: string;
  userId: number;
  username?: string;
  email?: string;
  role?: string;
  user?: User;
}

interface AuthContextType extends AuthState {
  login: (data: { token: string; user: User }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>({
    token: "",
    userId: 0,
    username: "",
    email: "",
    role: "",
    user: undefined,
  });

  // ✅ Load dữ liệu từ localStorage khi mở lại trang
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (storedToken && storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        setAuth({
          token: storedToken,
          userId: user.id,
          username: user.username,
          email: user.email,
          role: storedRole || user.role,
          user,
        });
      } catch (err) {
        console.error("❌ Lỗi parse user từ localStorage:", err);
      }
    }
  }, []);

  // ✅ Khi đăng nhập
  const login = (data: { token: string; user: User }) => {
    const { token, user } = data;

    setAuth({
      token,
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      user,
    });

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    if (user.role) localStorage.setItem("role", user.role);
    localStorage.setItem("username", user.username);
  };

  // ✅ Khi đăng xuất
  const logout = () => {
    setAuth({
      token: "",
      userId: 0,
      username: "",
      email: "",
      role: "",
      user: undefined,
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
