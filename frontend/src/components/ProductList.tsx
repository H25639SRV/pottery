import React from "react";
import { Product } from "../types";

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductList: React.FC<Props> = ({ products, onAddToCart }) => (
  <div>
    <h2>Danh sách sản phẩm</h2>
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          <img src={p.image_url} alt={p.name} width="100" />
          <p>
            {p.name} - {p.price} VND
          </p>
          <button onClick={() => onAddToCart(p)}>Thêm vào giỏ</button>
        </li>
      ))}
    </ul>
  </div>
);

export default ProductList;
