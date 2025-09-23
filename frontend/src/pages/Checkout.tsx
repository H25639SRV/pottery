import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Checkout: React.FC = () => {
  const { cart, checkout } = useAppContext();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng đang trống.");
      return;
    }
    checkout();
    navigate("/orders");
  };

  const total = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <div style={{ padding: 16 }}>
      <h2>Thanh toán</h2>

      {cart.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.name} — {item.price} VND
              </li>
            ))}
          </ul>

          <p>
            <strong>Tổng: {total} VND</strong>
          </p>

          <button onClick={handleCheckout}>Xác nhận & Thanh toán</button>
        </>
      )}
    </div>
  );
};

export default Checkout;
