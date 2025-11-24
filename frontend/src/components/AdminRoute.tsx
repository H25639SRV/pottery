import React, { ReactElement, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AdminRouteProps {
  children: ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // ✅ SỬA: Lấy user, isAdmin và isLoading từ context mới
  const { user, isAdmin, isLoading } = useAuth();

  const childName =
    typeof children.type === "string"
      ? children.type
      : (children.type as any)?.name || "UnknownComponent";

  useEffect(() => {
    if (!isLoading) {
      console.group("🧩 [AdminRoute Debug Info]");
      console.log("User:", user);
      console.log("Is Admin:", isAdmin);
      console.log("Children:", childName);
      console.groupEnd();
    }
  }, [user, isAdmin, childName, isLoading]);

  // ✅ 1. Chờ khôi phục session xong mới kiểm tra
  if (isLoading) {
    return (
      <div className="p-10 text-center">⏳ Đang kiểm tra quyền truy cập...</div>
    );
  }

  // ✅ 2. Kiểm tra đăng nhập
  if (!user) {
    console.warn("🚫 Chưa đăng nhập!");
    // alert("Vui lòng đăng nhập trước!"); // Có thể bỏ alert để trải nghiệm mượt hơn
    return <Navigate to="/login" replace />;
  }

  // ✅ 3. Kiểm tra quyền Admin
  if (!isAdmin) {
    console.warn("🚫 User không phải Admin:", user.role);
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/" replace />;
  }

  console.log("✅ Cho phép truy cập Admin:", childName);
  return children;
};

export default AdminRoute;
