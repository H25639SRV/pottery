import { Product, CartItem, User } from "../types";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

let mockProducts: Product[] = [
  {
    id: 1,
    name: "Chậu gốm tròn",
    price: 100000,
    image_url: "/images/pot1.jpg",
  },
  { id: 2, name: "Chậu cây mini", price: 50000, image_url: "/images/pot2.jpg" },
];

let cart: CartItem[] = [];

export async function login(email: string, password: string): Promise<User> {
  // giả sử luôn thành công
  return { id: 1, email, token: "mock-token" };
}

export async function getProducts(): Promise<Product[]> {
  return mockProducts;
}

export async function addToCart(product: Product): Promise<CartItem[]> {
  const existing = cart.find((item) => item.product.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ product, quantity: 1 });
  }
  return cart;
}

export async function getCart(): Promise<CartItem[]> {
  return cart;
}

export async function checkout(): Promise<string> {
  cart = [];
  return "Thanh toán thành công!";
}

export default api;
