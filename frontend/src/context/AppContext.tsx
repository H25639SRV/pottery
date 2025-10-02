import React, { createContext, useContext, useState } from "react";
import { CartItem, Order, Product, User } from "../types";

export interface AppContextType {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  login: (email: string, password: string) => void;
  logout: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  saveOrder: (items: CartItem[], total: number) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fake login
  const login = (email: string, password: string) => {
    setUser({
      id: 1,
      username: email.split("@")[0], // đơn giản tách từ email
      email,
      token: "mock-token",
    });
  };

  const logout = () => setUser(null);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const saveOrder = (items: CartItem[], total: number) => {
    const newOrder: Order = {
      id: Date.now(),
      items,
      total,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [...prev, newOrder]);
    setCart([]); // clear cart sau khi đặt hàng
  };

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        orders,
        login,
        logout,
        addToCart,
        removeFromCart,
        saveOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
