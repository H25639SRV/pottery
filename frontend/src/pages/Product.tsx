import React from "react";
import "../styles/Product.css";

const products = [
  {
    id: 1,
    name: "Bình hoa gốm",
    price: "200,000 VND",
    image: "/image/product1.png",
  },
  {
    id: 2,
    name: "Chậu cây nhỏ",
    price: "150,000 VND",
    image: "/image/product2.png",
  },
  {
    id: 3,
    name: "Ly gốm thủ công",
    price: "100,000 VND",
    image: "/image/product3.png",
  },
  {
    id: 4,
    name: "Bình trà gốm",
    price: "250,000 VND",
    image: "/image/product4.png",
  },
  {
    id: 5,
    name: "Đĩa gốm sứ",
    price: "180,000 VND",
    image: "/image/product5.png",
  },
  {
    id: 6,
    name: "Tách cà phê",
    price: "120,000 VND",
    image: "/image/product6.png",
  },
];

const Product: React.FC = () => {
  return (
    <div className="product-page">
      <h1 className="product-title">Bộ sưu tập sản phẩm</h1>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <h2 className="product-name">{product.name}</h2>
            <p className="product-price">{product.price}</p>
            <button className="add-to-cart">Thêm vào giỏ</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product;
