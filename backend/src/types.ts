export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description?: string;
}

export interface User {
  id: number;
  email: string;
  password: string; // hashed
}
