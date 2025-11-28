import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminPages.css";

const API_URL = process.env.REACT_APP_API_URL || "";

interface CustomRequest {
  id: number;
  userId: number;
  vaseName: string;
  patternFile: string;
  resultImage: string;
  address: string;
  paymentMethod: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes?: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

const getFullImageUrl = (rawPath: string) => {
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }
  return `${API_URL}${rawPath}`;
};

const AdminCustomRequestsPage: React.FC = () => {
  const { token, isAdmin, isLoading } = useAuth();
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    if (isLoading) return;

    if (!isAdmin) {
      setError("Bạn không có quyền truy cập trang này.");
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const response = await axios.get<CustomRequest[]>(
          `${API_URL}/api/admin/custom-requests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRequests(response.data);
      } catch (err: any) {
        console.error("Lỗi tải yêu cầu:", err);
        setError("Không thể tải danh sách yêu cầu.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token, isAdmin, isLoading]);

  const handleUpdateStatus = async (id: number, status: string) => {
    const finalNote = editingId === id ? noteInput : requests.find(r => r.id === id)?.adminNotes || "";

    try {
      await axios.patch(
        `${API_URL}/api/admin/custom-requests/${id}/status`,
        { status, adminNotes: finalNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? { ...req, status: status as any, adminNotes: finalNote }
            : req
        )
      );
      setEditingId(null);
      setNoteInput("");
      alert(`Đã cập nhật trạng thái thành: ${status}`);
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái.");
    }
  };

  if (loading) return <div className="admin-page-container">Đang tải...</div>;
  if (error)
    return <div className="admin-page-container error-message">{error}</div>;

  return (
    <div className="admin-page-container">
      <h1>Quản lý Yêu cầu Custom</h1>
      {requests.length === 0 ? (
        <p>Chưa có yêu cầu nào.</p>
      ) : (
        <div className="admin-grid-container">
          {requests.map((req) => (
            <div key={req.id} className="custom-req-card">
              <div className="req-image-wrapper">
                <img
                  src={getFullImageUrl(req.resultImage)}
                  alt={req.vaseName}
                  className="req-image"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/300?text=Ảnh+lỗi";
                  }}
                />
                <span
                  className={`status-badge status-${req.status.toLowerCase()}`}
                >
                  {req.status}
                </span>
              </div>

              <div className="req-info">
                <h3>{req.vaseName}</h3>
                
                <div className="req-shipping-info">
                  <div className="info-row">
                    <strong>Địa chỉ:</strong>
                    <span className="address-text">{req.address}</span>
                  </div>
                  <div className="info-row">
                    <strong>Thanh toán:</strong>
                    <span>{req.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</span>
                  </div>
                </div>

                <div className="req-meta">
                  <div className="info-row">
                    <strong>Khách:</strong>
                    <span>{req.user.username}</span>
                  </div>
                  <div className="info-row">
                    <strong>Email:</strong>
                    <span>{req.user.email}</span>
                  </div>
                  <div className="info-row">
                    <strong>Ngày tạo:</strong>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {req.adminNotes && (
                  <div className="admin-note-display">
                    <strong>Ghi chú Admin:</strong>
                    <p>{req.adminNotes}</p>
                  </div>
                )}

                <div className="req-actions">
                  {req.status === "PENDING" ? (
                    <>
                      <textarea
                        placeholder="Ghi chú cho khách (tùy chọn)..."
                        className="admin-note-input"
                        value={editingId === req.id ? noteInput : ""}
                        onChange={(e) => {
                          setEditingId(req.id);
                          setNoteInput(e.target.value);
                        }}
                      />
                      <div className="btn-group">
                        <button
                          className="btn-approve"
                          onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                        >Duyệt</button>
                        <button
                          className="btn-reject"
                          onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                        >Từ chối</button>
                      </div>
                    </>
                  ) : (
                    <button
                      className="btn-reset"
                      onClick={() => handleUpdateStatus(req.id, "PENDING")}
                    >Xét duyệt lại</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCustomRequestsPage;