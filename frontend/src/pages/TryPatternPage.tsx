import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import "../styles/TryPatternPage.css";
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "";

interface RenderResponse {
  message: string;
  resultUrl: string;
}

interface Product {
  id: number;
  name: string;
  templateName: string;
  basePath: string;
}

class MockFile extends File {
  constructor(name: string) {
    super([], name, { type: "image/png" });
  }
}

const stickers: string[] = Array.from(
  { length: 39 },
  (_, i) => `sticker/sticker${i + 1}.png`
);

const products: Product[] = [
  {
    id: 1,
    name: "Bình gốm trụ",
    templateName: "render.png",
    basePath: "https://raw.githubusercontent.com/H25639SRV/pottery/refs/heads/main/backend/public/templates/render.png",
  },
];

const TryPatternPage: React.FC = () => {
  const { user, token } = useAuth(); 
  const navigate = useNavigate();

  const [rendered, setRendered] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [progress, setProgress] = useState<{ [key: number]: number }>({});
  const [selectedFiles, setSelectedFiles] = useState<{
    [key: number]: File | MockFile | null;
  }>({});
  const [selectedStickerPath, setSelectedStickerPath] = useState<string | null>(null);
  const [address, setAddress] = useState<string>(""); 
  const [paymentMethod, setPaymentMethod] = useState<string>("cod"); 

  const handleFileChange = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setSelectedStickerPath(null);
    setSelectedFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleStickerSelect = (id: number, stickerPath: string) => {
    setSelectedStickerPath(stickerPath);
    const stickerName = stickerPath.split("/").pop() || "selected_sticker.png";
    const mockFile = new MockFile(stickerName);
    setSelectedFiles((prev) => ({ ...prev, [id]: mockFile }));
  };
  
  const handleRender = async (id: number, templateName: string) => {
    const file = selectedFiles[id];
    if (!file) {
      alert("⚠️ Vui lòng chọn hoa văn hoặc sticker trước khi render!");
      return;
    }

    const formData = new FormData();
    formData.append("templateName", templateName);

    if (file instanceof MockFile) {
      formData.append("stickerPath", file.name);
      formData.append(
        "pattern",
        new Blob([""], { type: "application/octet-stream" }),
        "placeholder.txt"
      );
    } else {
      formData.append("pattern", file);
    }

    try {
      setLoading((prev) => ({ ...prev, [id]: true }));
      setProgress((prev) => ({ ...prev, [id]: 0 }));
      const res = await axios.post<RenderResponse>(
        `${API_URL}/api/render`,
        formData,
        {
          onUploadProgress: (evt: any) => {
            if (evt.total) {
              const percent = Math.round((evt.loaded * 100) / evt.total);
              setProgress((prev) => ({ ...prev, [id]: percent }));
            }
          },
        } as any
      );

      if (res.data && res.data.resultUrl) {
        setRendered((prev) => ({
          ...prev,
          [id]: res.data.resultUrl,
        }));
      } else {
        throw new Error("Không có resultUrl trong phản hồi backend");
      }
    } catch (err: any) {
      console.error("❌ Lỗi render:", err);
      alert("❌ Render thất bại, vui lòng thử lại!");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
      setProgress((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  const handleSendCustomRequest = async (product: Product) => {
    const resultImage = rendered[product.id];
    const patternFile = selectedFiles[product.id];

    if (!user || !token) {
      alert("Vui lòng đăng nhập để gửi yêu cầu custom.");
      navigate("/login");
      return;
    }

    if (!resultImage) {
      alert("Bạn cần render hoa văn trước khi gửi yêu cầu.");
      return;
    }
    
    if (!address.trim()) {
        alert("Vui lòng nhập Địa chỉ giao hàng.");
        return;
    }
    
    if (!paymentMethod) {
        alert("Vui lòng chọn Phương thức thanh toán.");
        return;
    }

    if (!window.confirm("Bạn có chắc muốn gửi yêu cầu đặt làm sản phẩm này không?")) return;

    setLoading((prev) => ({ ...prev, [product.id]: true }));

    try {
      const payload = {
        userId: user.id, 
        vaseName: product.name,
        patternFile: patternFile?.name || "unknown_pattern",
        resultImage: resultImage, 
        address: address.trim(), 
        paymentMethod: paymentMethod, 
      };

      await axios.post(`${API_URL}/api/custom-request`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Đã gửi yêu cầu thành công! Admin sẽ xem xét và liên hệ lại.");

      setRendered((prev) => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });
      setSelectedFiles((prev) => ({ ...prev, [product.id]: null }));
      setSelectedStickerPath(null);
      setAddress(""); 
      setPaymentMethod("cod"); 
      
    } catch (err: any) {
      console.error("❌ Lỗi gửi yêu cầu custom:", err);
      alert("Lỗi khi gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleDownload = (id: number) => {
    const url = rendered[id];
    if (url) {
      const link = document.createElement("a");
      link.href = url.startsWith("http") ? url : `${API_URL}${url}`;
      link.download = `mocgom-custom-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (id: number) => {
    setRendered((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    setSelectedFiles((prev) => ({ ...prev, [id]: null }));
    setSelectedStickerPath(null);
  };

  const getRenderedImageUrl = (path: string) => {
    return path.startsWith("/") ? `${API_URL}${path}` : path;
  };

  const getStickerImageUrl = (path: string) => {
    return `https://raw.githubusercontent.com/H25639SRV/pottery/refs/heads/main/backend/public/${path}`;
  };

  return (
    <div className="try-page">
      <h1>Thử Hoa Văn Lên Bình Gốm</h1>
      {products.map((p) => (
        <div key={p.id} className="try-section">
          {/* Cột 1: Ảnh gốc */}
          <div className="try-column image-column">
            <h3>Ảnh gốc: {p.name}</h3>
            <div className="image-container">
              <img src={p.basePath} alt={p.name} className="result-image" />
            </div>
          </div>

          {/* Cột 2: Tùy chỉnh hoa văn */}
          <div className="try-column actions-column">
            <h3>Tùy chỉnh hoa văn</h3>

            <div className="upload-section">
              <label className="custom-file-label" htmlFor={`file-${p.id}`}>
                Chọn hoa văn từ máy tính
              </label>
              <input
                id={`file-${p.id}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(p.id, e)}
                style={{ display: "none" }}
              />

              {selectedFiles[p.id] && (
                <p className="selected-file-name">Đã chọn: {selectedFiles[p.id]?.name}</p>
              )}
            </div>

            <div className="sticker-separator">— HOẶC —</div>

            <div className="sticker-section">
              <h4>Chọn Sticker có sẵn:</h4>
              <div className="sticker-gallery">
                {stickers.map((stickerPath) => (
                  <img
                    key={stickerPath}
                    src={getStickerImageUrl(stickerPath)}
                    alt={stickerPath}
                    className={`sticker-item ${
                      selectedStickerPath === stickerPath ? "selected" : ""
                    }`}
                    onClick={() => handleStickerSelect(p.id, stickerPath)}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => handleRender(p.id, p.templateName)}
              disabled={loading[p.id] || !selectedFiles[p.id]}
              className="render-button"
            >
              {loading[p.id] ? "Đang xử lý..." : "Render"}
            </button>

            {loading[p.id] && (
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${progress[p.id] || 0}%` }}
                ></div>
                <span className="progress-text">Đang tạo ảnh: {progress[p.id] || 0}%</span>
              </div>
            )}
          </div>

          {/* Cột 3: Ảnh kết quả */}
          <div className="try-column result-column">
            <h3>Ảnh sau khi thêm hoa văn</h3>
            <div className="image-container">
              {rendered[p.id] ? (
                <img
                  src={getRenderedImageUrl(rendered[p.id])}
                  alt="Kết quả render"
                  className="result-image"
                />
              ) : (
                <div className="placeholder-wrapper">
                  {loading[p.id] ? (
                    <div className="loading-overlay">
                      <div className="spinner"></div>
                      <span className="placeholder-text">AI đang xử lý...</span>
                    </div>
                  ) : (
                    <div className="placeholder-content">
                      <span className="placeholder-icon">🖼️</span>
                      <span className="placeholder-text">
                        Kết quả sẽ hiển thị ở đây
                      </span>
                      <span className="placeholder-text">Chọn hoa văn và nhấn "Render"</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {rendered[p.id] && (
              <div className="shipping-section">
                <div className="form-group">
                  <label htmlFor={`address-${p.id}`}>Địa chỉ giao hàng:</label>
                  <textarea
                    id={`address-${p.id}`}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Vui lòng nhập địa chỉ (Tên người nhận, SĐT, số nhà, đường, xã/phường, quận/huyện, tỉnh/thành phố)"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`payment-${p.id}`}>Phương thức thanh toán:</label>
                  <select
                    id={`payment-${p.id}`}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                    <option value="bank_transfer">Chuyển khoản Ngân hàng</option>
                  </select>
                </div>
              </div>
            )}
            
            {rendered[p.id] && (
              <div className="action-buttons">
                <div className="secondary-buttons">
                  <button onClick={() => handleDownload(p.id)} className="btn-download">
                    Tải về
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="btn-delete">
                    Xóa
                  </button>
                </div>
                
                <button
                  onClick={() => handleSendCustomRequest(p)}
                  className="btn-custom-request"
                  disabled={loading[p.id] || !address.trim() || !paymentMethod}
                >
                  Gửi yêu cầu Custom
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TryPatternPage;