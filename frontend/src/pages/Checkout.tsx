import React, { useState } from "react";
import axios from "axios"; // ✅ Cần import axios
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Checkout.css";

const API_URL = process.env.REACT_APP_API_URL || "";

const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth(); // ✅ Cần lấy token để gửi kèm request

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"none" | "qr" | "cod">(
    "none"
  );
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái đang gửi

  const total = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const handleConfirm = async () => {
    // 1. Validation
    if (cart.length === 0) {
      alert("⚠️ Giỏ hàng trống!");
      return;
    }
    if (!address.trim()) {
      alert("⚠️ Vui lòng nhập địa chỉ giao hàng!");
      return;
    }
    if (paymentMethod === "none") {
      alert("⚠️ Vui lòng chọn phương thức thanh toán!");
      return;
    }

    // 2. Gửi dữ liệu xuống Backend
    setIsSubmitting(true);
    try {
      // ✅ GỌI API TẠO ĐƠN HÀNG THỰC TẾ
      await axios.post(
        `${API_URL}/api/orders`,
        {
          items: cart,
          total: total,
          address: address, // 🔥 QUAN TRỌNG: Gửi địa chỉ xuống
          paymentMethod: paymentMethod, // Gửi phương thức thanh toán
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Xác thực người dùng
          },
        }
      );

      // 3. Xử lý thành công
      if (paymentMethod === "qr") {
        alert(
          `🎉 Đơn hàng đã được tạo thành công!\nĐịa chỉ: ${address}\nVui lòng quét mã QR để hoàn tất.`
        );
      } else {
        alert(`✅ Đặt hàng thành công!\nĐơn hàng sẽ giao tới: ${address}`);
      }

      clearCart();
      setAddress("");
      setPaymentMethod("none");
    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      alert("❌ Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
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

            {/* Nhập địa chỉ */}
            <div className="checkout-section">
              <h3>📍 Địa chỉ nhận hàng:</h3>
              <textarea
                className="address-input"
                placeholder="Nhập số nhà, tên đường, phường/xã..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </div>

            {/* Chọn thanh toán */}
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

            <button
              onClick={handleConfirm}
              className="checkout-btn"
              disabled={isSubmitting} // Disable nút khi đang gửi
            >
              {isSubmitting ? "⏳ Đang xử lý..." : "✅ Xác nhận đặt hàng"}
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Checkout;
