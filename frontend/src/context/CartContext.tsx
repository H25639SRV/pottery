// H:\code\hoc\docker\pottery\frontend\src\context\CartContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { CartContextType, CartItem } from "../types";

const API_URL = process.env.REACT_APP_API_URL || "";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Dùng useCallback để tránh lặp vô hạn
  const fetchCart = useCallback(async (userId: number) => {
    try {
      const res = await axios.post<{ items: CartItem[] }>(
        `${API_URL}/api/cart/get-cart`,
        { userId }
      );
      setCart(res.data.items || []);
    } catch (err) {
      console.error(
        "⚠️ Không thể lấy giỏ hàng (User có thể chưa có giỏ):",
        err
      );
      // Không reset cart về rỗng ở đây để tránh nhấp nháy UI nếu lỗi mạng tạm thời
    }
  }, []);

  const addToCart = async (
    userId: number,
    productId: number,
    quantity: number = 1
  ) => {
    try {
      await axios.post(`${API_URL}/api/cart/add`, {
        userId,
        productId,
        quantity,
      });
      await fetchCart(userId);
    } catch (err) {
      console.error("❌ Lỗi thêm vào giỏ hàng:", err);
      // 🔑 QUAN TRỌNG: Ném lỗi ra để trang Product biết là thất bại
      throw err;
    }
  };

  const removeFromCart = async (userId: number, productId: number) => {
    try {
      await axios.post(`${API_URL}/api/cart/remove`, {
        userId,
        productId,
      });
      await fetchCart(userId);
    } catch (err) {
      console.error("❌ Lỗi khi xóa sản phẩm:", err);
      throw err;
    }
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, fetchCart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
