import React from "react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const Cart: React.FC = () => {
  const { cart, removeFromCart } = useAppContext();

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div>
      <h2>Giỏ hàng</h2>
      {cart.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.product.id}>
                {item.product.name} — {item.product.price} VND × {item.quantity}
                <button onClick={() => removeFromCart(item.product.id)}>
                  Xóa
                </button>
              </li>
            ))}
          </ul>
          <div>
            <strong>Tổng cộng:</strong> {total} VND
          </div>
          <Link to="/checkout">
            <button>Thanh toán</button>
          </Link>
        </>
      )}
    </div>
  );
};

export default Cart;
