import React, { createContext, useContext, useState, useEffect } from "react";

export type Product = {
  id: number;
  name: string;
  price: number;
};

type Order = {
  id: string;
  items: Product[];
  total: number;
  date: string;
};

type User = {
  username: string;
};

type AppContextType = {
  token: string | null;
  user: User | null;
  login: (token: string, username: string) => void;
  logout: () => void;

  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;

  orders: Order[];
  checkout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });

  // Lưu token + user khi thay đổi
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Lưu orders
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const login = (tk: string, username: string) => {
    setToken(tk);
    setUser({ username });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const addToCart = (product: Product) => setCart((prev) => [...prev, product]);
  const removeFromCart = (id: number) =>
    setCart((prev) => prev.filter((p) => p.id !== id));
  const clearCart = () => setCart([]);

  const checkout = () => {
    if (cart.length === 0) return;
    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 9),
      items: cart,
      total: cart.reduce((sum, p) => sum + p.price, 0),
      date: new Date().toLocaleString(),
    };
    setOrders((prev) => [...prev, newOrder]);
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        orders,
        checkout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
};
