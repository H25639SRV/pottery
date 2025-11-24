import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminPages.css"; // Dùng chung CSS

const API_URL = process.env.REACT_APP_API_URL || "";

interface CustomRequest {
  id: number;
  userId: number;
  vaseName: string;
  patternFile: string;
  resultImage: string;
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
  // ✅ SỬA: Lấy token, isAdmin và isLoading
  const { token, isAdmin, isLoading } = useAuth();
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    // Nếu đang load auth thì chưa làm gì cả
    if (isLoading) return;

    // Nếu không phải Admin thì báo lỗi
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
    try {
      await axios.patch(
        `${API_URL}/api/admin/custom-requests/${id}/status`,
        { status, adminNotes: noteInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? { ...req, status: status as any, adminNotes: noteInput }
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
                <p className="req-meta">
                  <strong>Khách:</strong> {req.user.username} <br />
                  <strong>Ngày:</strong>{" "}
                  {new Date(req.createdAt).toLocaleDateString()}
                </p>

                {req.adminNotes && (
                  <div className="admin-note-display">
                    <strong>Ghi chú Admin:</strong> {req.adminNotes}
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
                        >
                          Duyệt
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                        >
                          Từ chối
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      className="btn-reset"
                      onClick={() => handleUpdateStatus(req.id, "PENDING")}
                    >
                      Xét duyệt lại
                    </button>
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
