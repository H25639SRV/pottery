import React from "react";
import { useAppContext } from "../context/AppContext";

const Checkout: React.FC = () => {
  const { cart, saveOrder } = useAppContext();

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) return;
    saveOrder(cart, total);
    alert("Đặt hàng thành công!");
  };

  return (
    <div>
      <h2>Thanh toán</h2>
      {cart.length === 0 ? (
        <p>Không có sản phẩm để thanh toán.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.product.id}>
                {item.product.name} — {item.product.price} VND × {item.quantity}
              </li>
            ))}
          </ul>
          <div>
            <strong>Tổng cộng:</strong> {total} VND
          </div>
          <button onClick={handleCheckout}>Xác nhận đặt hàng</button>
        </>
      )}
    </div>
  );
};

export default Checkout;
