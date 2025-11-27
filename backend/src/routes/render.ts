import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { renderPattern } from "../controllers/renderController";

const router = express.Router();
const upload = multer({ dest: "public/uploads/" });

router.post("/", upload.single("pattern"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Thiếu file pattern (upload)" });
    }

    // Đọc ảnh pattern upload thành base64
    const patternBase64 = fs.readFileSync(file.path, { encoding: "base64" });
    console.log(`📂 Đã nhận pattern upload: ${file.originalname}`);

    // Template cố định (từ body hoặc mặc định)
    const templateName = req.body.templateName || "render.png";
    const angle = req.body.angle || "front";

    const assetsPath = fs.existsSync(path.join(process.cwd(), "dist/assets"))
      ? path.join(process.cwd(), "dist/assets")
      : path.join(process.cwd(), "src/assets");

    const templatePath = "https://raw.githubusercontent.com/H25639SRV/pottery/refs/heads/main/backend/public/templates/render.png";

    // Gắn vào req.body
    req.body.patternBase64 = patternBase64;
    req.body.templatePath = templatePath;
    req.body.angle = angle;

    // Gọi controller chính
    await renderPattern(req, res);
  } catch (err: any) {
    console.error("❌ Render route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
