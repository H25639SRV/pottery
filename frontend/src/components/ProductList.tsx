import React from "react";
import { useCart } from "../context/CartContext";
import { Product } from "../types";

const ProductList: React.FC<{ products: Product[] }> = ({ products }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
  };

  return (
    <div>
      <h2>Sản phẩm</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          marginTop: 12,
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ccc",
              padding: 12,
              width: 200,
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <img
              src={p.image_url || p.image || "https://via.placeholder.com/120"}
              alt={p.name}
              width={120}
              height={120}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />
            <h3 style={{ fontSize: "1rem", margin: "8px 0" }}>{p.name}</h3>
            <p style={{ margin: "4px 0" }}>{p.price.toLocaleString()} VND</p>
            <button
              onClick={() => handleAddToCart(p)}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
