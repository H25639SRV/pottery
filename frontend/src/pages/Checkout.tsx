import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Checkout.css";

const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"none" | "qr" | "cod">(
    "none"
  );

  const total = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const handleConfirm = () => {
    if (cart.length === 0) {
      alert("⚠️ Giỏ hàng trống!");
      return;
    }

    if (paymentMethod === "qr") {
      alert("🎉 Thanh toán bằng QR thành công! Cảm ơn bạn đã mua hàng ❤️");
      clearCart();
    } else if (paymentMethod === "cod") {
      alert("✅ Đơn hàng sẽ được giao và thanh toán khi nhận hàng.");
      clearCart();
    } else {
      alert("⚠️ Vui lòng chọn phương thức thanh toán!");
    }
  };

  return (
    <>
      <div className="checkout-page">
        <h2>🧾 Xác nhận Thanh toán</h2>
        <p>
          Khách hàng: <strong>{user?.username || "Khách vãng lai"}</strong>
        </p>

        {cart.length === 0 ? (
          <p>Không có sản phẩm để thanh toán.</p>
        ) : (
          <>
            <ul className="checkout-list">
              {cart.map((item) => (
                <li key={item.product.id} className="checkout-item">
                  <img
                    src={
                      item.product.image ||
                      item.product.image_url ||
                      "https://via.placeholder.com/60"
                    }
                    alt={item.product.name}
                    className="checkout-thumb"
                  />
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">
                      {item.product.name}
                    </span>{" "}
                    — <span>{item.product.price.toLocaleString()} VND</span> ×{" "}
                    <span>{item.quantity}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="checkout-total">
              <strong>Tổng cộng:</strong> {total.toLocaleString()} VND
            </div>

            <h3>Chọn phương thức thanh toán:</h3>
            <div className="payment-options">
              <button
                className={`payment-btn ${
                  paymentMethod === "qr" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("qr")}
              >
                🧾 Quét mã QR
              </button>
              <button
                className={`payment-btn ${
                  paymentMethod === "cod" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("cod")}
              >
                💵 Thanh toán khi nhận hàng
              </button>
            </div>

            {paymentMethod === "qr" && (
              <div className="checkout-qr">
                <h3>Quét mã QR để thanh toán</h3>
                <img
                  src="/image/qr.png"
                  alt="QR Thanh toán"
                  className="qr-image"
                />
              </div>
            )}

            <button onClick={handleConfirm} className="checkout-btn">
              ✅ Xác nhận đặt hàng
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Checkout;
