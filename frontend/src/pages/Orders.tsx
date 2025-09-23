import React from "react";
import { useAppContext } from "../context/AppContext";

const Orders: React.FC = () => {
  const { orders } = useAppContext();

  if (!orders || orders.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Đơn hàng</h2>
        <p>Bạn chưa có đơn hàng nào.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Đơn hàng của bạn</h2>
      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong>Mã đơn:</strong> {order.id} — <strong>Ngày:</strong>{" "}
            {order.date}
          </div>
          <ul>
            {order.items.map((it) => (
              <li key={it.id}>
                {it.name} — {it.price} VND
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 8 }}>
            <strong>Tổng:</strong> {order.total} VND
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
