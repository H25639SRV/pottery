import React, { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Cart.css";

const Cart: React.FC = () => {
  const { cart, fetchCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchCart(user.id);
    }
  }, [user?.id]);

  const handleCheckout = async () => {
    if (!user?.id) return alert("Bạn chưa đăng nhập!");
    try {
      await axios.post("/api/cart/checkout", {
        userId: user.id,
      });
      navigate("/checkout");
    } catch (err) {
      console.error("❌ Lỗi thanh toán:", err);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <h1 className="cart-title">🛒 Giỏ hàng của bạn</h1>

      {cart.length === 0 ? (
        <p>Giỏ hàng trống.</p>
      ) : (
        <div className="cart-page-container">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i}>
                  <td>
                    <img
                      src={
                        item.product?.image ||
                        item.product?.image_url ||
                        "https://via.placeholder.com/80"
                      }
                      alt={item.product?.name || "Sản phẩm"}
                      className="cart-item-image"
                    />
                  </td>
                  <td>{item.product?.name}</td>
                  <td>{item.product?.price.toLocaleString()} VND</td>
                  <td>{item.quantity}</td>
                  <td>
                    {(
                      (item.product?.price || 0) * item.quantity
                    ).toLocaleString()}{" "}
                    VND
                  </td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() =>
                        user?.id && removeFromCart(user.id, item.product.id)
                      }
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tổng tiền + nút thanh toán */}
          <div className="cart-summary">
            <h2 className="cart-total">
              Tổng cộng: <span>{total.toLocaleString()} VND</span>
            </h2>
            <button className="checkout-btn" onClick={handleCheckout}>
              ✅ Tiến hành thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
