// src/components/AdminRoute.tsx
import React, { ReactElement, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AdminRouteProps {
  children: ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { token, role } = useAuth();

  // ✅ Xác định tên component con để log (tránh lỗi type)
  const childName =
    typeof children.type === "string"
      ? children.type
      : (children.type as any)?.name || "UnknownComponent";

  // ✅ Ghi log chi tiết để debug
  useEffect(() => {
    console.group("🧩 [AdminRoute Debug Info]");
    console.log("Token (từ context):", token);
    console.log("Role (từ context):", role);
    console.log("LocalStorage token:", localStorage.getItem("token"));
    console.log("LocalStorage role:", localStorage.getItem("role"));
    console.log("Children component:", childName);
    console.groupEnd();
  }, [token, role, childName]);

  // ✅ Điều kiện kiểm tra
  if (!token) {
    console.warn("🚫 Không có token — có thể chưa đăng nhập hoặc mất session!");
    alert("Vui lòng đăng nhập trước!");
    return <Navigate to="/login" replace />;
  }

  if (role !== "ADMIN") {
    console.warn("🚫 Vai trò hiện tại KHÔNG PHẢI ADMIN:", role);
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/" replace />;
  }

  console.log("✅ Cho phép truy cập vào trang Admin:", childName);
  return children;
};

export default AdminRoute;
