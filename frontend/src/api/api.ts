import { Product, User } from "../types";

export async function login(email: string, password: string): Promise<User> {
  // giả sử luôn thành công
  return { id: 1, username: "mockuser", email, token: "mock-token" };
}

export async function getProducts(): Promise<Product[]> {
  // mock dữ liệu
  return [
    {
      id: 1,
      name: "Gốm chén",
      price: 100000,
      image_url: "/template/image/pottery1.png",
      description: "Chén gốm thủ công",
    },
    {
      id: 2,
      name: "Bình gốm",
      price: 200000,
      image_url: "/template/image/pottery2.png",
      description: "Bình gốm trang trí",
    },
  ];
}
