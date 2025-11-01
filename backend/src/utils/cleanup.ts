import fs from "fs";
import path from "path";

const RENDER_DIR = path.join(__dirname, "../../public/render_output");

export const cleanupOldRenders = () => {
  const files = fs.readdirSync(RENDER_DIR);
  const now = Date.now();

  files.forEach((file) => {
    const filePath = path.join(RENDER_DIR, file);
    const stats = fs.statSync(filePath);
    const age = (now - stats.mtimeMs) / 1000 / 3600; // giờ

    if (age > 24) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Đã xoá file cũ: ${file}`);
    }
  });
};
