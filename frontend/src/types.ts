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
  email: string;
  token: string;
}
