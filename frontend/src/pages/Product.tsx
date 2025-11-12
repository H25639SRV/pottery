import React, { useEffect, useState } from "react";

import axios from "axios";

import { useAuth } from "../context/AuthContext";

import { useLocation } from "react-router-dom";

import "../styles/Product.css";

// 🔑 KHAI BÁO BIẾN MÔI TRƯỜNG API URL

const API_URL = process.env.REACT_APP_API_URL || "";

interface Product {
  id: number;

  name: string;

  price: number;

  image: string;
}

const Product: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [filtered, setFiltered] = useState<Product[]>([]);

  const { user } = useAuth();

  const userId = user?.id;

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const searchTerm = queryParams.get("query")?.toLowerCase() || "";

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const results = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm)
      );

      setFiltered(results);
    } else {
      setFiltered(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      // ✅ Sửa lỗi đường dẫn: Dùng API_URL

      const res = await axios.get<Product[]>(`${API_URL}/api/products`);

      setProducts(res.data);
    } catch (err) {
      console.error("❌ Lỗi tải sản phẩm:", err);
    }
  };

  const addToCart = async (productId: number) => {
    if (!userId) {
      if (
        window.confirm(
          "Bạn cần đăng nhập để thêm vào giỏ hàng. Đăng nhập ngay?"
        )
      ) {
        window.location.href = "/login";
      }

      return;
    }

    try {
      // ✅ Sửa lỗi đường dẫn: Dùng API_URL

      await axios.post(`${API_URL}/api/cart/add`, {
        userId,

        productId,

        quantity: 1,
      });

      alert("🛒 Đã thêm vào giỏ hàng!");

      if (
        window.confirm("Đã thêm vào giỏ hàng, bạn muốn vào giỏ hàng xem không?")
      ) {
        window.location.href = "/cart";
      }
    } catch (err) {
      console.error("❌ Lỗi thêm giỏ hàng:", err);

      alert("Không thể thêm sản phẩm vào giỏ hàng!");
    }
  };

  return (
    <div className="product-page">
      <h1 className="product-title">
        {searchTerm
          ? `Kết quả tìm kiếm cho: "${searchTerm}"`
          : "Bộ sưu tập sản phẩm"}
      </h1>

      <div className="product-grid">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <div className="product-card" key={product.id}>
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />

              <h2 className="product-name">{product.name}</h2>

              <p className="product-price">
                {product.price.toLocaleString()} VND
              </p>

              <button
                onClick={() => addToCart(product.id)}
                className="add-to-cart"
              >
                Thêm vào giỏ
              </button>
            </div>
          ))
        ) : (
          <p>Không tìm thấy sản phẩm phù hợp.</p>
        )}
      </div>

      {searchTerm && filtered.length === 0 && (
        <p>Không tìm thấy sản phẩm nào khớp với tìm kiếm.</p>
      )}
    </div>
  );
};

export default Product;
