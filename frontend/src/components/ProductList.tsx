import React from "react";
import { useCart } from "../context/CartContext";

const ProductList: React.FC = () => {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({ productId: 1, name: "Chậu hoa", price: 100000, quantity: 1 });
  };

  return (
    <div>
      <button onClick={handleAdd}>Thêm vào giỏ</button>
    </div>
  );
};

export default ProductList;
