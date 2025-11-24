import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminPages.css";

const API_URL = process.env.REACT_APP_API_URL || "";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  isCustom: boolean;
  customImage?: string;
  product: {
    id: number;
    name: string;
    image: string | null;
  };
}

// 1. Cập nhật Interface Order để khớp với dữ liệu mới
interface Order {
  id: number;
  userId: number;
  createdAt: string;
  status: string;
  total: number;
  address?: string; // Thêm trường này
  paymentMethod?: string; // Thêm trường này
  user: {
    id: number;
    username: string;
    email: string;
  };
  items: OrderItem[];
}

const AdminOrdersPage: React.FC = () => {
  const { token, isAdmin, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper để hiển thị tên phương thức thanh toán đẹp hơn
  const getPaymentLabel = (method?: string) => {
    if (method === "qr") return "🧾 QR Code";
    if (method === "cod") return "💵 COD (Khi nhận hàng)";
    return "Không xác định";
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAdmin) {
      setError("Bạn không có quyền truy cập trang này.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>(
          `${API_URL}/api/admin/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(response.data);
      } catch (err: any) {
        console.error("Lỗi khi tải đơn hàng:", err);
        setError("Không thể tải đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, isAdmin, isLoading]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    if (!window.confirm(`Cập nhật đơn hàng #${orderId} thành "${newStatus}"?`))
      return;

    try {
      await axios.patch(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      alert("Cập nhật thành công!");
    } catch (err: any) {
      alert("Lỗi cập nhật trạng thái.");
    }
  };

  if (loading)
    return <div className="admin-page-container">Đang tải đơn hàng...</div>;
  if (error)
    return <div className="admin-page-container error-message">{error}</div>;

  return (
    <div className="admin-page-container">
      <h1>Quản lý Đơn hàng</h1>
      {orders.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        <div className="admin-list-container">
          {orders.map((order) => (
            <div key={order.id} className="admin-item-card">
              <div className="item-header">
                <h2>Đơn hàng #{order.id}</h2>
                <span
                  className={`status-badge status-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </span>
              </div>

              {/* 2. Hiển thị thông tin Khách hàng & Giao hàng */}
              <div
                style={{
                  marginBottom: "15px",
                  borderBottom: "1px dashed #eee",
                  paddingBottom: "10px",
                }}
              >
                <p>
                  <strong>Khách hàng:</strong> {order.user.username} (
                  {order.user.email})
                </p>
                <p>
                  <strong>📍 Địa chỉ:</strong>{" "}
                  {order.address || (
                    <span style={{ color: "red" }}>Chưa có địa chỉ</span>
                  )}
                </p>
                <p>
                  <strong>💳 Thanh toán:</strong>{" "}
                  {getPaymentLabel(order.paymentMethod)}
                </p>
                <p>
                  <strong>Ngày đặt:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <p>
                <strong>Tổng cộng:</strong>{" "}
                <span style={{ fontSize: "1.1em", color: "#d32f2f" }}>
                  {order.total.toLocaleString()} VNĐ
                </span>
              </p>

              <div className="item-details">
                <h3>Chi tiết sản phẩm:</h3>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <img
                        src={item.product.image || "/placeholder.png"}
                        alt={item.product.name}
                        className="item-thumbnail"
                      />
                      {item.product.name} x {item.quantity} -{" "}
                      {item.price.toLocaleString()} VNĐ
                      {item.isCustom && item.customImage && (
                        <>
                          {" "}
                          (Custom){" "}
                          <a
                            href={item.customImage}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            [Xem ảnh]
                          </a>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="item-actions">
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                  className="status-select"
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="PROCESSING">Đang thực hiện</option>
                  <option value="SHIPPED">Đang giao hàng</option>
                  <option value="DELIVERED">Đã giao hàng</option>
                  <option value="CANCELED">Đã hủy</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
