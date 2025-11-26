// src/pages/Product.tsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Product.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category_id?: number;
  story?: string;
}

const Product: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const userId = user?.id;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Lấy các tham số từ URL
  const searchTerm = queryParams.get("query") || "";
  const categoryId = queryParams.get("category") || "";
  const sortBy = queryParams.get("sort") || ""; // 'category', 'relevance', 'all'

  // --- HÀM TẢI DỮ LIỆU TỪ BACKEND DỰA TRÊN URL ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProducts([]); // Xóa dữ liệu cũ khi bắt đầu tải mới

    // Xây dựng URL API dựa trên các tham số
    const apiUrl = new URL(`${API_URL}/api/products`);

    if (searchTerm) {
      apiUrl.searchParams.append("query", searchTerm);
    }
    if (categoryId) {
      apiUrl.searchParams.append("category", categoryId);
    }
    if (sortBy) {
      // Dùng tham số sort để backend xử lý sắp xếp (ví dụ: theo category, theo tìm kiếm)
      apiUrl.searchParams.append("sort", sortBy);
    }

    try {
      // 🚨 Backend của bạn cần được thiết lập để đọc các tham số query, category, sort này.
      const res = await axios.get<Product[]>(apiUrl.toString());

      if (Array.isArray(res.data)) {
        const formattedData = res.data.map((p) => ({
          ...p,
          category_id: p.category_id || undefined,
          story: p.story || "Đang cập nhật...",
        }));
        setProducts(formattedData);
      } else {
        console.error("❌ API không trả về mảng dữ liệu hợp lệ.");
        setProducts([]);
      }
    } catch (err) {
      console.error("❌ Lỗi tải danh sách sản phẩm:", err);
      setError(
        "Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối API."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryId, sortBy]); // Chạy lại khi URL thay đổi

  // --- EFFECT CHÍNH: TẢI SẢN PHẨM MỖI KHI URL THAY ĐỔI ---
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Dependency là hàm fetchProducts (đã được useCallback bọc)

  const handleAddToCart = async (productId: number, productName: string) => {
    if (!userId) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/login");
      return;
    }

    try {
      await addToCart(userId, productId, 1);
      const confirm = window.confirm(
        `🛒 Đã thêm sản phẩm "${productName}" vào giỏ hàng thành công! \n\nBạn có muốn chuyển đến Giỏ hàng không?`
      );

      if (confirm) {
        navigate("/cart");
      }
    } catch (err) {
      alert("Lỗi thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  const getPageTitle = () => {
    if (searchTerm) {
      return `Kết quả tìm kiếm`;
    }

    // Logic này chỉ dùng để hiển thị tiêu đề, không dùng để lọc nữa
    switch (categoryId) {
      case "1":
        return "Dáng Việt";
      case "2":
        return "Âm vang di sản";
      default:
        return "Bộ sưu tập";
    }
  };

  const getSubtitle = () => {
    if (searchTerm) {
      return `Kết quả tìm kiếm cho: "${searchTerm}"`;
    }
    if (categoryId) {
      return `Các sản phẩm thuộc danh mục: ${getPageTitle()}`;
    }
    return "Các sản phẩm nổi bật";
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/detail/${productId}`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", width: "100%", padding: "40px" }}>
          <p>Đang tải dữ liệu sản phẩm...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div
          style={{
            textAlign: "center",
            width: "100%",
            padding: "40px",
            color: "red",
          }}
        >
          <p>⚠️ Lỗi: {error}</p>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div style={{ textAlign: "center", width: "100%", padding: "40px" }}>
          <p>Không tìm thấy sản phẩm nào phù hợp với yêu cầu.</p>
        </div>
      );
    }

    return (
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div
              onClick={() => handleProductClick(product.id)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />

              <h2 className="product-name">{product.name}</h2>

              <p className="product-price">
                {product.price.toLocaleString()} VND
              </p>
            </div>

            <button
              onClick={() => handleAddToCart(product.id, product.name)}
              className="add-to-cart"
            >
              Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="product-page">
      {/* Banner */}
      <div className="product-banner-wrapper">
        <img
          src="/image/potterybackground2.png"
          alt="Banner Gốm Việt"
          className="product-banner-image"
        />
        <div className="product-banner-overlay">
          <h1 className="product-banner-title">{getPageTitle()}</h1>
        </div>
      </div>

      <h1 className="product-title-detail">{getSubtitle()}</h1>

      {renderContent()}
    </div>
  );
};

export default Product;
