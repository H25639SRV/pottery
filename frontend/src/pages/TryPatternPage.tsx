import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import "../styles/TryPatternPage.css";

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

const TryPatternPage: React.FC = () => {
  const [rendered, setRendered] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [progress, setProgress] = useState<{ [key: number]: number }>({});
  const [selectedFiles, setSelectedFiles] = useState<{
    [key: number]: File | null;
  }>({});

  const products: Product[] = [
    {
      id: 1,
      name: "Bình gốm 1",
      templateName: "render1.png",
      basePath: "/render/render1.png",
    },
    {
      id: 2,
      name: "Bình gốm 2",
      templateName: "render2.png",
      basePath: "/render/render2.png",
    },
  ];

  // ✅ Khi chọn file
  const handleFileChange = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [id]: file }));
    console.log("🟢 File được chọn:", file.name);
  };

  // ✅ Khi nhấn "Render"
  const handleRender = async (id: number, templateName: string) => {
    const file = selectedFiles[id];
    if (!file) {
      alert("⚠️ Vui lòng chọn hoa văn trước khi render!");
      return;
    }

    const formData = new FormData();
    formData.append("pattern", file);
    formData.append("templateName", templateName);
    formData.append("angle", "front");

    try {
      setLoading((prev) => ({ ...prev, [id]: true }));
      setProgress((prev) => ({ ...prev, [id]: 0 }));

      const res = await axios.post<RenderResponse>("/api/render", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // ép kiểu any để TypeScript không báo lỗi
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onUploadProgress: (evt: any) => {
          if (evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setProgress((prev) => ({ ...prev, [id]: percent }));
          }
        },
      } as any);

      console.log("🟢 Phản hồi backend:", res.data);
      if (res.data && res.data.resultUrl) {
        setRendered((prev) => ({ ...prev, [id]: res.data.resultUrl }));
      } else {
        throw new Error("Không có resultUrl trong phản hồi backend");
      }
    } catch (err: any) {
      console.error("❌ Lỗi render:", err);
      if (err.response) {
        alert(
          `❌ Render thất bại: ${err.response.status} ${err.response.statusText}`
        );
        console.log("đây là code mới");
        console.log("Chi tiết phản hồi lỗi:", err.response.data);
      } else {
        alert("❌ Render thất bại, vui lòng thử lại!");
      }
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
      setProgress((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  return (
    <div className="try-page">
      <h1>✨ Thử Hoa Văn Lên Bình Gốm ✨</h1>

      {products.map((p) => (
        <div key={p.id} className="try-row">
          {/* Ảnh gốc */}
          <div className="col">
            <h3>Ảnh gốc</h3>
            <img
              src={p.basePath}
              alt={p.name}
              style={{ width: "200px", borderRadius: "8px" }}
            />
          </div>

          {/* Khu vực upload */}
          <div className="col actions">
            <label className="custom-file-label" htmlFor={`file-${p.id}`}>
              🌸 Chọn hoa văn
            </label>
            <input
              id={`file-${p.id}`}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(p.id, e)}
              style={{ display: "none" }}
            />

            <button
              onClick={() => handleRender(p.id, p.templateName)}
              disabled={loading[p.id]}
            >
              {loading[p.id] ? "Đang xử lý..." : "Render"}
            </button>

            {loading[p.id] && (
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${progress[p.id] || 0}%` }}
                ></div>
                <span className="progress-text">{progress[p.id] || 0}%</span>
              </div>
            )}
          </div>

          {/* Ảnh kết quả */}
          <div className="col">
            <h3>Ảnh sau khi thêm hoa văn</h3>
            {rendered[p.id] ? (
              <img
                src={rendered[p.id]}
                alt="Kết quả"
                style={{ width: "200px", borderRadius: "8px" }}
              />
            ) : (
              <p>Chưa có ảnh</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TryPatternPage;
