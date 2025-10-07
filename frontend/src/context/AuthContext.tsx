import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

interface AuthContextType {
  token: string | null;
  role: string | null;
  email: string | null;
  login: (token: string, role: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  email: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    Cookies.get("token") || null
  );
  const [role, setRole] = useState<string | null>(Cookies.get("role") || null);
  const [email, setEmail] = useState<string | null>(
    Cookies.get("email") || null
  );

  const login = (token: string, role: string, email: string) => {
    setToken(token);
    setRole(role);
    setEmail(email);
    Cookies.set("token", token, { expires: 7 });
    Cookies.set("role", role, { expires: 7 });
    Cookies.set("email", email, { expires: 7 });
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setEmail(null);
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("email");
  };

  // ✅ Giữ session khi F5
  useEffect(() => {
    const savedToken = Cookies.get("token");
    const savedRole = Cookies.get("role");
    const savedEmail = Cookies.get("email");
    if (savedToken && savedRole && savedEmail) {
      setToken(savedToken);
      setRole(savedRole);
      setEmail(savedEmail);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
