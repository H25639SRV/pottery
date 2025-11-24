import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage, Image } from "canvas";
import sharp from "sharp";
import * as renderService from "../services/renderService";

const PUBLIC_DIR = path.join(__dirname, "../../public");
const TEMPLATE_DIR = path.join(PUBLIC_DIR, "templates");
// Định nghĩa thư mục Sticker
const STICKER_DIR = path.join(PUBLIC_DIR, "sticker");
const OUTPUT_DIR = path.join(PUBLIC_DIR, "render_output");

if (!fs.existsSync(TEMPLATE_DIR))
  fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Hàm mới: Chỉ vẽ pattern duy nhất, căn giữa và áp dụng fade dọc.
 */
const warpPatternAdvanced = (
  patternImg: Image,
  vaseWidth: number,
  vaseHeight: number
) => {
  const canvas = createCanvas(vaseWidth, vaseHeight);
  const ctx = canvas.getContext("2d");

  const topPadding = 60;
  const bottomPadding = 40;
  const effectiveHeight = vaseHeight - topPadding - bottomPadding;
  const baseOpacity = 1.0;

  // 📐 TÍNH TOÁN KÍCH THƯỚC VÀ VỊ TRÍ CỦA MỘT PATTERN DUY NHẤT

  const patternOriginalWidth = patternImg.width;
  const patternOriginalHeight = patternImg.height;

  // Pattern chiếm khoảng 50% chiều rộng của bình
  const patternRenderWidth = vaseWidth * 0.5;
  // Tính chiều cao pattern tương ứng để giữ tỉ lệ
  const patternRenderHeight =
    patternOriginalHeight * (patternRenderWidth / patternOriginalWidth);

  // Vị trí đặt Pattern
  const patternX = (vaseWidth - patternRenderWidth) / 2; // Căn giữa X
  // Đặt Pattern giữa vùng hiệu dụng theo chiều dọc
  const patternY = topPadding + (effectiveHeight - patternRenderHeight) / 2;

  // -------------------------------------------------------------
  // VÒNG LẶP ĐỂ TẠO HIỆU ỨNG FADE THEO CHIỀU DỌC
  // -------------------------------------------------------------

  for (let y = 0; y < vaseHeight; y++) {
    // Chỉ xử lý trong vùng hiệu dụng của bình
    if (y < topPadding || y >= vaseHeight - bottomPadding) {
      continue;
    }

    // 1. Tính toán hiệu ứng mờ dọc (Vertical Fade)
    const normalizedY = (y - topPadding) / effectiveHeight;
    let verticalOpacity: number = 1;
    const verticalFadeRange = 0.15; // 15% trên và dưới

    if (normalizedY < verticalFadeRange) {
      verticalOpacity = normalizedY / verticalFadeRange;
    } else if (normalizedY > 1 - verticalFadeRange) {
      verticalOpacity = (1 - normalizedY) / verticalFadeRange;
    }
    verticalOpacity = Math.max(0.1, Math.min(1, verticalOpacity));

    // 2. Tính toán Opacity cuối cùng
    let opacity = verticalOpacity * baseOpacity;
    ctx.globalAlpha = opacity;

    // 3. VẼ HÀNG PIXEL (Pattern duy nhất)

    // Kiểm tra xem y có nằm trong vùng pattern đã tính toán
    if (y >= patternY && y < patternY + patternRenderHeight) {
      // Tính toán vị trí pixel Y tương ứng trên ảnh Pattern gốc
      const patternSourceY =
        (y - patternY) * (patternOriginalHeight / patternRenderHeight);

      // Vẽ 1 hàng pixel từ patternImg:
      ctx.drawImage(
        patternImg,
        0, // Source X
        patternSourceY, // Source Y: Vị trí Y tương ứng trên ảnh pattern
        patternOriginalWidth, // Source Width
        1, // Source Height

        // Destination
        patternX, // Dest X (Vị trí căn giữa)
        y, // Dest Y
        patternRenderWidth, // Dest Width (Chiều rộng đã scale)
        1 // Dest Height
      );
    }
  }
  ctx.globalAlpha = 1;
  return canvas;
};

// Hàm removeWhiteBackground (giữ nguyên)
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

// Hàm getPatternBrightness (giữ nguyên)
const getPatternBrightness = async (patternBuffer: Buffer): Promise<number> => {
  try {
    const { dominant } = await sharp(patternBuffer).stats();
    const avgBrightness = (dominant.r + dominant.g + dominant.b) / 3;
    console.log(`📊 Pattern brightness: ${avgBrightness.toFixed(0)}`);
    return avgBrightness;
  } catch {
    return 128;
  }
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
      // --- Xử lý Sticker ---
      const filename = path.basename(stickerPath);
      const fullStickerPath = path.join(STICKER_DIR, filename);

      if (!fs.existsSync(fullStickerPath)) {
        console.error(`❌ Không tìm thấy sticker: ${fullStickerPath}`);
        return res
          .status(404)
          .json({ error: `Không tìm thấy sticker: ${filename}` });
      }

      patternFileName = filename;
      patternBuffer = fs.readFileSync(fullStickerPath);
      fileSource = "Sticker";
      console.log(`💿 Đọc sticker từ disk: ${fullStickerPath}`);
    } else if (patternFile) {
      // --- Xử lý File Upload ---
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
      // Nếu không có cả stickerPath và patternFile, mới trả về lỗi
      return res.status(400).json({ error: "Thiếu hoa văn hoặc sticker" });
    }

    const templatePath = path.join(TEMPLATE_DIR, templateName);

    if (!fs.existsSync(templatePath)) {
      console.error(`❌ Không tìm thấy ảnh template: ${templatePath}`);
      return res.status(404).json({ error: "Không tìm thấy ảnh template" });
    }

    console.log(
      "🎨 Bắt đầu render pattern (Quy trình 100% Canvas Composite)..."
    );

    // --- [LOGIC CANVAS] ---

    // 1. CHUẨN BỊ
    const metadata = await sharp(patternBuffer).metadata();
    if (!metadata.hasAlpha) {
      console.log("⚠️ Loại bỏ background trắng");
      patternBuffer = await removeWhiteBackground(patternBuffer);
    }
    const patternBrightness = await getPatternBrightness(patternBuffer);
    const isDarkPattern = patternBrightness < 100;

    // 🔑 ĐIỀU CHỈNH: Làm rõ pattern hơn
    console.log(`🔄 Modulating pattern...`);
    patternBuffer = await sharp(patternBuffer)
      // Tăng nhẹ độ sáng (brightness) và độ bão hòa (saturation)
      .modulate({ brightness: 1.2, saturation: 1.1 })
      .toBuffer();

    // 2. TẢI VÀO CANVAS
    console.log("🚀 Tải ảnh vào Canvas...");
    const templateImg = await loadImage(templatePath);
    const patternImg = await loadImage(patternBuffer);

    const width = templateImg.width;
    const height = templateImg.height;
    console.log(`📏 Kích thước: ${width}x${height}`);

    // 3. WARP
    console.log(`🏺 Warping pattern (Single Pattern Logic)...`);
    const warpedCanvas = warpPatternAdvanced(patternImg, width, height);

    // 4. GHÉP BẰNG CANVAS
    console.log("🌈 Blend ảnh bằng Canvas...");
    const mainCanvas = createCanvas(width, height);
    const ctx = mainCanvas.getContext("2d");

    // Vẽ ảnh gốc (có lá) làm nền
    ctx.drawImage(templateImg, 0, 0, width, height);

    // Đặt chế độ blend
    let blendMode: any = "overlay";
    if (isDarkPattern) {
      blendMode = "overlay";
    }
    ctx.globalCompositeOperation = blendMode;

    // Vẽ hoa văn đã uốn (warped) lên trên
    ctx.drawImage(warpedCanvas, 0, 0, width, height);

    // Lấy buffer kết quả từ Canvas
    const finalBuffer = mainCanvas.toBuffer("image/png");

    // 5. CẮT (Dùng Sharp ở bước cuối)
    console.log("✂️ Cắt ảnh (dùng Sharp)...");
    let sharpInstance = sharp(finalBuffer);

    const CROP_PX_SIDE = 16;
    const cropWidth = width - 2 * CROP_PX_SIDE;
    const cropHeight = height;

    if (cropWidth > 0 && cropHeight > 0) {
      console.log(
        `✅ Áp dụng crop: ${cropWidth}x${cropHeight}, left: ${CROP_PX_SIDE}`
      );
      sharpInstance = sharpInstance.extract({
        left: CROP_PX_SIDE,
        top: 0,
        width: cropWidth,
        height: cropHeight,
      });
    } else {
      console.warn(
        `⚠️ Bỏ qua crop. Kích thước gốc (${width}x${height}) quá nhỏ.`
      );
    }

    const finalResult = await sharpInstance.toBuffer();
    // --- [KẾT THÚC CẮT] ---

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
