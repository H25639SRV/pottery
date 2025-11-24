// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// 1️⃣ Cập nhật Interface User cho khớp với Database
export interface User {
  id: number;
  username: string;
  email: string;
  role: string; // Quan trọng: Thêm role để phân quyền
  // Thêm các trường khác nếu cần (avatar, phone...)
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean; // 🆕 Tiện ích: Kiểm tra nhanh quyền Admin
  isLoading: boolean; // Quan trọng: Tránh redirect sai khi F5
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 2️⃣ useEffect: Khôi phục phiên đăng nhập khi F5
  useEffect(() => {
    const restoreSession = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Kiểm tra sơ bộ xem parsedUser có phải là object hợp lệ không
          if (parsedUser && typeof parsedUser === "object") {
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            // Dữ liệu rác -> Xóa ngay
            throw new Error("Invalid user data");
          }
        } catch (error) {
          console.error(
            "⚠️ Lỗi dữ liệu LocalStorage, tiến hành đăng xuất...",
            error
          );
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false); // ✅ Kết thúc quá trình tải
    };

    restoreSession();
  }, []);

  // 3️⃣ Hàm Login
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // 4️⃣ Hàm Logout
  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Tùy chọn: Chuyển hướng về trang chủ hoặc login
    // window.location.href = "/login";
  };

  // 5️⃣ Tính toán quyền hạn
  const isAuthenticated = !!user;
  // Kiểm tra role (Lưu ý: Database bạn lưu là "ADMIN" hay "admin"? Nên check cả 2 cho chắc)
  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
