import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { CartContextType, CartItem } from "../types";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchCart = async (userId: number) => {
    try {
      const res = await axios.get<{ items: CartItem[] }>(
        `http://localhost:5000/api/cart/${userId}`
      );
      setCart(res.data.items || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải giỏ hàng:", err);
      setCart([]);
    }
  };

  const addToCart = async (
    userId: number,
    productId: number,
    quantity: number = 1
  ) => {
    try {
      await axios.post("http://localhost:5000/api/cart/add", {
        userId,
        productId,
        quantity,
      });
      await fetchCart(userId);
    } catch (err) {
      console.error("❌ Lỗi thêm vào giỏ hàng:", err);
    }
  };

  // 🆕 Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (userId: number, productId: number) => {
    try {
      await axios.post("http://localhost:5000/api/cart/remove", {
        userId,
        productId,
      });
      await fetchCart(userId);
    } catch (err) {
      console.error("❌ Lỗi khi xóa sản phẩm khỏi giỏ:", err);
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
