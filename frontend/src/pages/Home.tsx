// src/pages/Home.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";

const API_URL = process.env.REACT_APP_API_URL || "";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category_id?: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const MAX_FEATURED = 5;

  // Khởi tạo là mảng rỗng, không dùng MOCK_PRODUCTS nữa
  const [products, setProducts] = useState<Product[]>([]);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const backgroundImages = [
    "/image/potterybackground.png",
    "/image/potterybackground2.png",
    "/image/potterybackground3.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => nextImage(), 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      if (Array.isArray(res.data)) {
        const formatted = res.data.map((p: any) => ({
          id: Number(p.id || p._id),
          name: p.name,
          price: p.price,
          image: p.image,
          category_id: p.category_id,
        }));

        // Chỉ lấy dữ liệu thật từ API
        setProducts(formatted.slice(0, MAX_FEATURED));
      } else {
        console.error("❌ API /api/products không trả về mảng.");
        setProducts([]); // Đặt về rỗng nếu API lỗi định dạng
      }
    } catch (err) {
      console.error("❌ Lỗi tải sản phẩm:", err);
      setProducts([]); // Đặt về rỗng nếu gọi API thất bại
    }
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
  };
  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? backgroundImages.length - 1 : prev - 1
    );
  };

  const handleAddToCart = async (productId: number) => {
    if (!user?.id) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/login");
      return;
    }

    const productToAdd = products.find((p) => p.id === productId);
    const productName = productToAdd?.name || "sản phẩm";
    try {
      await addToCart(user.id, productId, 1);
      const confirm = window.confirm(
        `🛒 Đã thêm sản phẩm "${productName}" vào giỏ hàng thành công! \n\nBạn có muốn chuyển đến Giỏ hàng không?`
      );
      if (confirm) {
        navigate("/cart");
      }
    } catch (err) {
      console.error("❌ Lỗi thêm vào giỏ hàng:", err);
      alert("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/detail/${productId}`);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-wrapper">
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className={`hero-slide ${
              index === currentImage ? "active" : "inactive"
            }`}
            style={{ backgroundImage: `url(${img})` }}
          ></div>
        ))}
        <div className="hero-overlay">
          <h1 className="home-title">Mộc Gốm</h1>
          <h2 className="home-title">Chậu cây tự tưới bằng gốm</h2>
          <p className="home-subtitle">Tinh hoa Gốm Việt</p>
          <button className="home-button" onClick={() => navigate("/product")}>
            Bộ sưu tập
          </button>
        </div>
        <button className="arrow left" onClick={prevImage}>
          ❮
        </button>
        <button className="arrow right" onClick={nextImage}>
          ❯
        </button>
        <div className="home-progress-bar">
          {backgroundImages.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentImage ? "active" : ""}`}
              onClick={() => setCurrentImage(index)}
            ></span>
          ))}
        </div>
      </div>

      {/* Sản phẩm nổi bật */}
      <h2 className="featured-title">Sản phẩm nổi bật</h2>
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} className="product-card">
              <div
                onClick={() => handleProductClick(p.id)}
                style={{ cursor: "pointer" }}
              >
                <img src={p.image} alt={p.name} className="product-img" />
                <h3>{p.name}</h3> <p>{p.price.toLocaleString()} VND</p>
              </div>
              <button onClick={() => handleAddToCart(p.id)}>
                Thêm vào giỏ
              </button>
            </div>
          ))
        ) : (
          <p className="loading-message">
            {API_URL
              ? "Đang tải sản phẩm hoặc chưa có sản phẩm nào..."
              : "Vui lòng kiểm tra kết nối API."}
          </p>
        )}
      </div>

      {/* Feature Boxes */}
      <div className="feature-container">
        {[
          "Tinh hoa Gốm Việt",
          "Nét đẹp thủ công",
          "Vẻ đẹp văn hóa",
          "Hồn Việt trong đồ gốm",
        ].map((title, index) => (
          <div className="feature-box" key={index}>
            <div className="icon-wrap">
              <img
                src="/icon/potteryicon.png"
                alt="icon"
                className="feature-icon"
              />
            </div>
            <h5 className="feature-title">{title}</h5>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
