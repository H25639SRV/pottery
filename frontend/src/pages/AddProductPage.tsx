// src/pages/AddProductPage.tsx

import React, { useState } from "react";

// 🔑 KHAI BÁO BIẾN MÔI TRƯỜNG API URL

const API_URL = process.env.REACT_APP_API_URL;

const AddProductPage: React.FC = () => {
  const [name, setName] = useState("");

  const [price, setPrice] = useState("");

  const [description, setDescription] = useState("");

  const handleAdd = async () => {
    const token = localStorage.getItem("token");

    if (!token) return alert("Vui lòng đăng nhập lại!");

    // ⚠️ KIỂM TRA LỖI CẤU HÌNH

    if (!API_URL) {
      console.error("Lỗi: REACT_APP_API_URL chưa được cấu hình!");

      alert("Lỗi cấu hình API. Vui lòng liên hệ quản trị viên.");

      return;
    }

    // 🔑 SỬA DÒNG NÀY: Nối API_URL với đường dẫn API

    const res = await fetch(`${API_URL}/api/products`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({ name, price, description }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Thêm sản phẩm thành công!");

      setName("");

      setPrice("");

      setDescription("");
    } else {
      alert(data.message || "Thêm thất bại!");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Thêm sản phẩm mới</h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Tên sản phẩm"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-2"
        placeholder="Giá"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Mô tả"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleAdd}
      >
        Thêm sản phẩm
      </button>
    </div>
  );
};

export default AddProductPage;
