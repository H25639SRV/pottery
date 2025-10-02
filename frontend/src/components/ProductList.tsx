import React from "react";
import { useAppContext } from "../context/AppContext";
import { Product } from "../types";

const ProductList: React.FC<{ products: Product[] }> = ({ products }) => {
  const { addToCart } = useAppContext();

  return (
    <div>
      <h2>Sản phẩm</h2>
      <div style={{ display: "flex", gap: 16 }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: 8 }}>
            <img src={p.image_url} alt={p.name} width={120} />
            <h3>{p.name}</h3>
            <p>{p.price} VND</p>
            <button onClick={() => addToCart(p)}>Thêm vào giỏ</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
