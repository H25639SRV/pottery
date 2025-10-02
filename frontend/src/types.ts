export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  token: string;
}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  createdAt: string; // ISO string
}
