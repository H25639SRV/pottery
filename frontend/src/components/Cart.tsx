import React from "react";
import { CartItem } from "../types";

interface Props {
  cart: CartItem[];
  onCheckout: () => void;
}

const Cart: React.FC<Props> = ({ cart, onCheckout }) => (
  <div>
    <h2>Giỏ hàng</h2>
    <ul>
      {cart.map((item, i) => (
        <li key={i}>
          {item.product.name} x {item.quantity}
        </li>
      ))}
    </ul>
    <button onClick={onCheckout}>Thanh toán</button>
  </div>
);

export default Cart;
