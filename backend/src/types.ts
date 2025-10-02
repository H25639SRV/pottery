// src/types.ts

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  createdAt: string; // ISO string
}
