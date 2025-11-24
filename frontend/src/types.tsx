// src/types.tsx

export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  image_url?: string;
  description?: string;
}

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  token?: string;
  role?: string;
}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  createdAt: string;
}

// ✅ Bổ sung các thuộc tính mà NavBar, AdminRoute và Login cần
export interface AuthContextType {
  token: string | null;
  role: string | null;
  username: string | null;
  email: string | null;
  user: User | null;
  login: (data: {
    token: string;
    role?: string;
    username?: string;
    email?: string;
    user?: User;
  }) => void;
  logout: () => void;
}

export interface CartContextType {
  cart: CartItem[];
  fetchCart: (userId: number) => Promise<void>;
  addToCart: (
    userId: number,
    productId: number,
    quantity?: number
  ) => Promise<void>;
  clearCart: () => void;
  removeFromCart: (userId: number, productId: number) => Promise<void>;
}
