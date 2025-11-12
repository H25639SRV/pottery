// src/config/apiConfig.ts

// Đảm bảo tên biến môi trường này TRÙNG KHỚP với tên bạn đặt trên Netlify (ví dụ: REACT_APP_API_URL)
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

// Export một hàm tiện ích để tạo URL hoàn chỉnh
export const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;
