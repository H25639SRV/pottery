import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  const backgroundImages = [
    "/image/potterybackground.png",
    "/image/potterybackground2.png",
    "/image/potterybackground3.png",
    "/image/potterybackground4.png",
  ];

  // Tự động chạy slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? backgroundImages.length - 1 : prev - 1
    );
  };

  const products = [
    {
      id: 1,
      name: "Bình hoa gốm",
      price: 200000,
      image: "/image/pottery1.png",
    },
    {
      id: 2,
      name: "Chậu cây nhỏ",
      price: 150000,
      image: "/image/pottery2.png",
    },
    {
      id: 3,
      name: "Ly gốm thủ công",
      price: 100000,
      image: "/image/pottery3.png",
    },
    {
      id: 4,
      name: "Bình trà gốm",
      price: 250000,
      image: "/image/pottery4.png",
    },
    { id: 5, name: "Đĩa gốm sứ", price: 180000, image: "/image/pottery5.png" },
    { id: 6, name: "Tách cà phê", price: 120000, image: "/image/pottery6.png" },
  ];

  return (
    <div className="home-container">
      {/* Hero slideshow */}
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
          <button className="home-button" onClick={() => navigate("/product")}>
            Bộ sưu tập
          </button>
        </div>

        {/* Nút chuyển ảnh */}
        <button className="arrow left" onClick={prevImage}>
          ❮
        </button>
        <button className="arrow right" onClick={nextImage}>
          ❯
        </button>

        {/* Thanh chấm chuyển ảnh */}
        <div className="progress-bar">
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
            <button>Thêm vào giỏ</button>
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
