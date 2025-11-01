import { createCanvas, loadImage } from "canvas";
import path from "path";
import fs from "fs";

export async function applyPatternToVase(
  templatePath: string,
  patternBase64: string,
  outputPath: string
) {
  const template = await loadImage(templatePath);
  const patternBuffer = Buffer.from(patternBase64, "base64");
  const pattern = await loadImage(patternBuffer);

  const canvas = createCanvas(template.width, template.height);
  const ctx = canvas.getContext("2d");

  // Vẽ ảnh gốc (gốm)
  ctx.drawImage(template, 0, 0, template.width, template.height);

  // Áp pattern theo một góc nhẹ (mô phỏng cong gốm)
  ctx.save();
  ctx.transform(1, 0.2, 0.1, 1, 0, 0); // bạn có thể điều chỉnh tỉ lệ này
  ctx.globalAlpha = 0.8; // độ trong suốt pattern
  ctx.drawImage(pattern, 50, 80, template.width - 100, template.height - 200);
  ctx.restore();

  // Lưu kết quả
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);
  console.log("✅ Rendered pattern saved to", outputPath);
}
