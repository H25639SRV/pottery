import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartWidget: React.FC = () => {
  const { cart } = useCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link to="/cart" className="cart-widget">
      🛒 Giỏ hàng ({count})
    </Link>
  );
};

export default CartWidget;
