// src/components/ProtectedRoute.tsx
import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string; // ví dụ: "ADMIN"
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Nếu chưa đăng nhập → chuyển đến login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu yêu cầu role cụ thể mà không khớp → về trang chủ
  if (requiredRole && role !== requiredRole) {
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
