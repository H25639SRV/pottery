import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";

interface Product {
  id: number; // 👈 đổi từ _id thành id để đồng nhất với backend
  name: string;
  price: number;
  image: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const backgroundImages = [
    "/image/potterybackground.png",
    "/image/potterybackground2.png",
    "/image/potterybackground3.png",
    "/image/potterybackground4.png",
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
      const res = await axios.get<Product[]>("/api/products");

      // 🔧 ép kiểu id nếu backend trả về _id dạng string
      const formatted = res.data.map((p: any) => ({
        id: Number(p.id || p._id),
        name: p.name,
        price: p.price,
        image: p.image,
      }));

      setProducts(formatted);
    } catch (err) {
      console.error("❌ Lỗi tải sản phẩm:", err);
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
      alert("⚠️ Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng!");
      return;
    }

    try {
      await addToCart(user.id, productId, 1);
      alert("🛒 Sản phẩm đã được thêm vào giỏ hàng!");
      if (
        window.confirm("Đã thêm vào giỏ hàng, bạn muốn vào giỏ hàng xem không?")
      ) {
        window.location.href = "/cart";
      }
    } catch (err) {
      console.error("❌ Lỗi thêm vào giỏ hàng:", err);
      alert("Không thể thêm sản phẩm vào giỏ hàng!");
    }
  };

  return (
    <div className="home-container">
      {/* Slideshow */}
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
          <h1 className="home-title">Chào mừng đến với Mộc Gốm</h1>
          <p className="home-subtitle">Tinh hoa Gốm Việt</p>
          <button className="home-button" onClick={() => navigate("/products")}>
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
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <img src={p.image} alt={p.name} className="product-img" />
            <h3>{p.name}</h3>
            <p>{p.price.toLocaleString()} VND</p>
            <button onClick={() => handleAddToCart(p.id)}>Thêm vào giỏ</button>
          </div>
        ))}
      </div>

      {/* Feature boxes */}
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
