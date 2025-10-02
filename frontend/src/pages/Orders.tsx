import React from "react";
import { useAppContext } from "../context/AppContext";

const Orders: React.FC = () => {
  const { orders } = useAppContext();

  return (
    <div>
      <h2>Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{ border: "1px solid #ccc", padding: 12, margin: 8 }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong>Mã đơn:</strong> {order.id} — <strong>Ngày:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </div>
            <ul>
              {order.items.map((it) => (
                <li key={it.product.id}>
                  {it.product.name} — {it.product.price} VND x {it.quantity}
                </li>
              ))}
            </ul>
            <div>
              <strong>Tổng cộng:</strong> {order.total} VND
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
