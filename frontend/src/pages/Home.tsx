import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();

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

  const features = [
    { icon: "/icon/potteryicon.png", title: "Tinh hoa Gốm Việt" },
    { icon: "/icon/thucong.png", title: "Nét đẹp thủ công" },
    { icon: "/icon/culture.png", title: "Vẻ đẹp văn hóa" },
    { icon: "/icon/soul.png", title: "Hồn Việt trong đồ gốm" },
  ];

  return (
    <div className="home-container">
      {/* Hero section */}
      <div
        className="home-hero"
        style={{ backgroundImage: "url('/image/potterybackground.png')" }}
      >
        <h1 className="home-title">Chào mừng đến với Mộc Gốm</h1>
        <p className="home-subtitle">Tinh hoa Gốm Việt</p>
        <button className="home-button" onClick={() => navigate("product")}>
          Bộ sưu tập
        </button>
      </div>

      {/* Feature Section */}
      <section className="feature-section">
        {features.map((item, index) => (
          <div className="feature-box" key={index}>
            <div className="icon-wrap">
              <img src={item.icon} alt={item.title} className="feature-icon" />
            </div>
            <h5 className="feature-title">{item.title}</h5>
          </div>
        ))}
      </section>

      {/* Tiêu đề */}
      <h2 className="featured-title">Sản phẩm nổi bật</h2>

      {/* Danh sách sản phẩm */}
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
    </div>
  );
};

export default Home;
