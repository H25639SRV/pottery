import React, { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

import axios from "axios";

import "../styles/Search.css";

// 🔑 KHAI BÁO BIẾN MÔI TRƯỜNG API URL

const API_URL = process.env.REACT_APP_API_URL || "";

interface Product {
  id: number;

  name: string;

  price: number;

  image?: string;

  image_url?: string;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Search: React.FC = () => {
  const query = useQuery();

  const searchTerm = query.get("query")?.toLowerCase() || "";

  const [results, setResults] = useState<Product[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        // ✅ Sửa lỗi đường dẫn: Dùng API_URL

        const res = await axios.get<Product[]>(`${API_URL}/api/product`);

        const allProducts = res.data;

        const filtered = allProducts.filter((p) =>
          p.name.toLowerCase().includes(searchTerm)
        );

        setResults(filtered);
      } catch (err) {
        console.error("❌ Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  return (
    <div className="search-container">
      <h2 className="search-title">
        🔍 Kết quả tìm kiếm cho: <span>"{searchTerm}"</span>
      </h2>

      {loading ? (
        <p>Đang tìm kiếm...</p>
      ) : (
        <div className="search-grid">
          {results.length > 0 ? (
            results.map((p) => (
              <div key={p.id} className="search-card">
                <img
                  src={
                    p.image || p.image_url || "https://via.placeholder.com/150"
                  }
                  alt={p.name}
                  className="search-image"
                />

                <h3>{p.name}</h3>

                <p className="search-price">{p.price.toLocaleString()} VND</p>
              </div>
            ))
          ) : (
            <p>Không tìm thấy sản phẩm phù hợp.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
