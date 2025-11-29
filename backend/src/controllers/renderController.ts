import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage, Image } from "canvas";
import sharp from "sharp";
import * as renderService from "../services/renderService";

const PUBLIC_DIR = path.join(__dirname, "../../public");
const TEMPLATE_DIR = path.join(PUBLIC_DIR, "templates");
const STICKER_DIR = path.join(PUBLIC_DIR, "sticker");
const OUTPUT_DIR = path.join(PUBLIC_DIR, "render_output");

if (!fs.existsSync(TEMPLATE_DIR))
  fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Hàm mới: Pattern 50% chiều rộng bình, căn giữa, KHÔNG tràn đế
 */
const warpPatternAdvanced = (
  patternImg: Image,
  vaseWidth: number,
  vaseHeight: number
) => {
  const canvas = createCanvas(vaseWidth, vaseHeight);
  const ctx = canvas.getContext("2d");

  // TĂNG PADDING để bảo vệ phần đế
  const topPadding = 80;       // Tăng lên để đẩy pattern lên cao
  const bottomPadding = 150;   // Tăng đáng kể để tránh phần đế
  const effectiveHeight = vaseHeight - topPadding - bottomPadding;
  const baseOpacity = 0.7;

  // Kích thước pattern gốc
  const patternOriginalWidth = patternImg.width;
  const patternOriginalHeight = patternImg.height;

  // KÍCH THƯỚC PATTERN: 50% chiều rộng bình
  const patternRenderWidth = vaseWidth * 0.5;
  const patternRenderHeight =
    patternOriginalHeight * (patternRenderWidth / patternOriginalWidth);

  // QUAN TRỌNG: GIỚI HẠN CHIỀU CAO PATTERN để không tràn đế
  let finalWidth = patternRenderWidth;
  let finalHeight = patternRenderHeight;

  // Nếu pattern cao hơn 60% vùng hiệu dụng thì thu nhỏ theo chiều cao
  const maxHeightRatio = 0.6; // Giảm từ 0.8 xuống 0.6
  if (finalHeight > effectiveHeight * maxHeightRatio) {
    finalHeight = effectiveHeight * maxHeightRatio;
    finalWidth = patternOriginalWidth * (finalHeight / patternOriginalHeight);
    console.log(`🔻 Pattern thu nhỏ để tránh tràn đế: ${finalWidth.toFixed(0)}x${finalHeight.toFixed(0)}`);
  }

  // VỊ TRÍ CĂN GIỮA - ĐẨY CAO HƠN để tránh đế
  const patternX = (vaseWidth - finalWidth) / 2;
  // Sử dụng 0.4 thay vì 0.5 để pattern nằm cao hơn trong vùng hiệu dụng
  const patternY = topPadding + (effectiveHeight - finalHeight) * 0.4;

  console.log(`📐 Pattern: ${finalWidth.toFixed(0)}x${finalHeight.toFixed(0)}, vị trí Y: ${patternY.toFixed(0)}`);
  console.log(`🛡️ Vùng an toàn: top=${topPadding}, bottom=${bottomPadding}, effective=${effectiveHeight}`);

  // VẼ PATTERN VỚI OPACITY 70%
  ctx.globalAlpha = baseOpacity;
  ctx.drawImage(
    patternImg,
    0,
    0,
    patternOriginalWidth,
    patternOriginalHeight,
    patternX,
    patternY,
    finalWidth,
    finalHeight
  );

  ctx.globalAlpha = 1;
  return canvas;
};

/**
 * Hàm loại bỏ background trắng
 */
const removeWhiteBackground = async (
  patternBuffer: Buffer,
  threshold: number = 245
): Promise<Buffer> => {
  try {
    console.log("🧹 Loại bỏ background trắng từ pattern...");
    const { data, info } = await sharp(patternBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixels = new Uint8ClampedArray(data);
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      if (r > threshold && g > threshold && b > threshold) {
        pixels[i + 3] = 0;
      }
    }
    return await sharp(pixels, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toBuffer();
  } catch (error) {
    console.error("⚠️ Không thể loại bỏ background, dùng pattern gốc");
    return patternBuffer;
  }
};

/**
 * Hàm lấy đường dẫn template dựa trên templateName
 */
const getTemplatePath = (templateName: string): string => {
  const baseUrl = "https://raw.githubusercontent.com/H25639SRV/pottery/refs/heads/main/frontend/public/render";
  
  const colorTemplates = [
    "black.png", "blue.png", "brown.png", "gray.png", "green.png", 
    "orange.png", "pink.png", "purple.png", "red.png", "yellow.png", "render.png"
  ];
  
  if (colorTemplates.includes(templateName)) {
    return `${baseUrl}/${templateName}`;
  }
  
  console.log(`⚠️ Template ${templateName} không được tìm thấy, sử dụng mặc định render.png`);
  return `${baseUrl}/render.png`;
};

export const renderPattern = async (req: Request, res: Response) => {
  let tempFilePath: string | undefined;

  try {
    const { templateName, stickerPath } = req.body;
    const patternFile = req.file;

    if (!templateName) {
      return res.status(400).json({ error: "Thiếu templateName" });
    }

    let patternBuffer: Buffer;
    let patternFileName: string;
    let fileSource: string;

    // 🔑 LOGIC: Ưu tiên xử lý Sticker
    if (stickerPath) {
      try {
        console.log(`🌐 Tải sticker từ URL: https://raw.githubusercontent.com/H25639SRV/pottery/refs/heads/main/backend/public/sticker/${stickerPath}`);

        const response = await fetch(`https://raw.githubusercontent.com/H25639SRV/pottery/refs/heads/main/backend/public/sticker/${stickerPath}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        patternBuffer = Buffer.from(arrayBuffer);
        patternFileName = path.basename(stickerPath) || "sticker.png";
        fileSource = "Sticker (URL)";
        console.log(`✅ Đã tải sticker từ URL: ${stickerPath}`);
      } catch (stickerError: any) {
        console.error(`❌ Lỗi tải sticker:`, stickerError);
        return res.status(400).json({
          error: `Không thể tải sticker: ${stickerError.message}`,
        });
      }
    } else if (patternFile) {
      patternFileName = patternFile.originalname || "unknown_pattern.png";
      tempFilePath = patternFile.path;
      fileSource = "Upload";

      const MAX_SIZE_MB = 10;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
      if (patternFile.size > MAX_SIZE_BYTES) {
        console.error(
          `❌ File quá lớn: ${(patternFile.size / 1024 / 1024).toFixed(2)}MB`
        );
        if (patternFile.path) {
          fs.unlinkSync(patternFile.path);
          console.log(`🗑️ Đã xóa file tạm (quá lớn): ${patternFile.path}`);
        }
        return res.status(413).json({
          error: `File hoa văn quá lớn. Vui lòng chọn ảnh nhỏ hơn ${MAX_SIZE_MB}MB.`,
        });
      }

      if (!tempFilePath) {
        throw new Error("Không tìm thấy đường dẫn file.");
      }
      console.log(`💿 Đọc file tạm từ disk: ${tempFilePath}`);
      patternBuffer = fs.readFileSync(tempFilePath);
    } else {
      return res.status(400).json({ error: "Thiếu hoa văn hoặc sticker" });
    }

    // Sử dụng hàm getTemplatePath để lấy đường dẫn template chính xác
    const templatePath = getTemplatePath(templateName);
    console.log(`🖼️ Sử dụng template: ${templatePath}`);

    console.log("🎨 Bắt đầu render pattern (Pattern 50% width, KHÔNG tràn đế)...");

    // --- [LOGIC CANVAS] ---

    // 1. CHUẨN BỊ
    const metadata = await sharp(patternBuffer).metadata();
    if (!metadata.hasAlpha) {
      console.log("⚠️ Loại bỏ background trắng");
      patternBuffer = await removeWhiteBackground(patternBuffer);
    }

    // 2. TẢI VÀO CANVAS
    console.log("🚀 Tải ảnh vào Canvas...");
    const templateImg = await loadImage(templatePath);
    const patternImg = await loadImage(patternBuffer);

    const width = templateImg.width;
    const height = templateImg.height;
    console.log(`📏 Kích thước: ${width}x${height}`);

    // 3. WARP PATTERN VỚI BẢO VỆ ĐẾ
    console.log(`🏺 Warping pattern (50% width, bảo vệ đế)...`);
    const warpedCanvas = warpPatternAdvanced(patternImg, width, height);

    // 4. GHÉP BẰNG CANVAS
    console.log("🌈 Blend ảnh bằng Canvas...");
    const mainCanvas = createCanvas(width, height);
    const ctx = mainCanvas.getContext("2d");

    // Vẽ ảnh gốc (có lá) làm nền
    ctx.drawImage(templateImg, 0, 0, width, height);

    // Sử dụng blend mode "multiply" để tự nhiên hơn
    ctx.globalCompositeOperation = "multiply";
    
    // Vẽ hoa văn đã uốn (warped) lên trên
    ctx.drawImage(warpedCanvas, 0, 0, width, height);

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";

    // Lấy buffer kết quả từ Canvas
    const finalBuffer = mainCanvas.toBuffer("image/png");

    // 5. CẮT CHÍNH GIỮA
    console.log("✂️ Cắt ảnh chính giữa...");
    let sharpInstance = sharp(finalBuffer);

    const CROP_PX_SIDE = 16;
    const cropWidth = width - 2 * CROP_PX_SIDE;
    const cropHeight = height;

    if (cropWidth > 0 && cropHeight > 0) {
      console.log(`✅ Áp dụng crop chính giữa: ${cropWidth}x${cropHeight}, left: ${CROP_PX_SIDE}`);
      sharpInstance = sharpInstance.extract({
        left: CROP_PX_SIDE,
        top: 0,
        width: cropWidth,
        height: cropHeight,
      });
    } else {
      console.warn(`⚠️ Bỏ qua crop. Kích thước gốc (${width}x${height}) quá nhỏ.`);
    }

    const finalResult = await sharpInstance.toBuffer();

    const filename = `render_${Date.now()}.png`;
    const filePath = path.join(OUTPUT_DIR, filename);
    await fs.promises.writeFile(filePath, finalResult);
    const resultUrl = `/render_output/${filename}`;

    try {
      await renderService.saveRenderResult(
        templateName,
        patternFileName,
        resultUrl
      );
      console.log("✅ Đã lưu kết quả render vào DB");
    } catch (dbError) {
      console.error("❌ Lỗi lưu kết quả render vào DB:", dbError);
    }

    console.log(`✅ Render hoàn tất: ${filename}`);
    return res.status(200).json({
      message: "Render completed",
      resultUrl: resultUrl,
    });
  } catch (err: any) {
    console.error("❌ Render error:", err);
    if (err.message && err.message.includes("Input")) {
      return res.status(500).json({
        error: "Lỗi xử lý ảnh (Invalid Input), có thể file hoa văn bị lỗi.",
      });
    }
    return res
      .status(500)
      .json({ error: err.message || "Lỗi máy chủ không xác định" });
  } finally {
    if (tempFilePath) {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log(`🗑️ Đã xóa file tạm: ${tempFilePath}`);
        }
      } catch (cleanErr) {
        console.error(`❌ Không thể xóa file tạm: ${tempFilePath}`, cleanErr);
      }
    }
  }
};