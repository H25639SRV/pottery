import React, { useState } from "react";
import axios from "axios";

const RenderPreview: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleUpload = async () => {
    if (!file) return alert("Vui lòng chọn ảnh hoa văn!");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("pattern", file);

      const config: any = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt: ProgressEvent) => {
          if (evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setProgress(percent);
          }
        },
      };

      const res = await axios.post<{ message: string; resultUrl: string }>(
        "/api/render",
        formData,
        config
      );

      setPreview(res.data.resultUrl);
    } catch (err: any) {
      console.error("❌ Render lỗi:", err);
      alert("Render thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="render-preview">
      <h2>Render hoa văn lên bình gốm</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Đang xử lý..." : "Render"}
      </button>

      {loading && (
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
              height: "6px",
              background: "green",
            }}
          />
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{ maxWidth: "300px", marginTop: "20px" }}
        />
      )}
    </div>
  );
};

export default RenderPreview;
