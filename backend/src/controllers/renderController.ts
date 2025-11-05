import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage, Image } from "canvas";
import sharp from "sharp";

const OUTPUT_DIR = path.join(__dirname, "../../public/render_output");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// --- 🌐 Cấu hình hình dạng cho các template (Dễ dàng mở rộng) ---
const VASE_SHAPE_MAP: { [key: string]: "round" | "cylinder" } = {
  render1: "round",
  render2: "cylinder",
};

// --- 🔧 Hàm warp pattern đơn giản hóa với độ cong nhẹ và opacity ---
const warpPatternAdvanced = (
  patternImg: Image,
  vaseWidth: number,
  vaseHeight: number,
  vaseShape: "round" | "cylinder" = "round"
) => {
  const canvas = createCanvas(vaseWidth, vaseHeight);
  const ctx = canvas.getContext("2d");

  // Điều chỉnh repeat factor dựa trên hình dạng
  const repeatFactor = vaseShape === "cylinder" ? 2.0 : 2.5;

  // Vẫn cần một pattern canvas đủ rộng để tránh lặp lại đột ngột khi scaling
  const patternCanvas = createCanvas(vaseWidth * repeatFactor, vaseHeight);
  const patternCtx = patternCanvas.getContext("2d");

  const patternCanvasPattern = patternCtx.createPattern(patternImg, "repeat");
  if (patternCanvasPattern) {
    patternCtx.fillStyle = patternCanvasPattern;
    patternCtx.fillRect(0, 0, vaseWidth * repeatFactor, vaseHeight);
  }

  // Padding cho phần trên và dưới (có thể điều chỉnh)
  const topPadding = vaseShape === "cylinder" ? 60 : 120;
  const bottomPadding = vaseShape === "cylinder" ? 40 : 120;
  const effectiveHeight = vaseHeight - topPadding - bottomPadding;

  // Tăng opacity mặc định
  const baseOpacity = vaseShape === "round" ? 1.0 : 0.9; // Đảm bảo độ đậm cao nhất: Round 1.0, Cylinder 0.9

  for (let y = 0; y < vaseHeight; y++) {
    let scale: number;
    let opacity: number;
    let scaledWidth: number = 0;
    let offsetX: number = 0;

    if (y < topPadding || y >= vaseHeight - bottomPadding) {
      ctx.globalAlpha = 0;
      continue;
    }

    const normalizedY = (y - topPadding) / effectiveHeight;

    // --- LOGIC MỚI (Universal: Nén lại, tạo độ cong nhẹ, áp dụng cho mọi hình dạng) ---

    // 1. Tính toán Scale (Độ nén ngang)
    if (vaseShape === "cylinder") {
      // Giữ cho scale = 1.0 để pattern trên hình trụ thẳng tuyệt đối
      scale = 1.0;
    } else {
      // CÔNG THỨC MỚI: Đảm bảo LỒI Ở GIỮA và LÕM Ở HAI ĐẦU (Scale max ở giữa)
      const compressionFactor = 0.35;
      const sinValue = Math.sin(normalizedY * Math.PI);
      // Scale sẽ nằm trong khoảng [1.0 - compressionFactor, 1.0]
      scale = 1.0 - compressionFactor + compressionFactor * sinValue;
    }

    // 2. Tính toán Opacity (Độ mờ)

    // Opacity Dọc (Vertical Fade: Mờ dần ở phía trên/dưới)
    const verticalFadeRange = 0.15;
    let verticalOpacity: number = 1;

    if (normalizedY < verticalFadeRange) {
      verticalOpacity = normalizedY / verticalFadeRange;
    } else if (normalizedY > 1 - verticalFadeRange) {
      verticalOpacity = (1 - normalizedY) / verticalFadeRange;
    }
    verticalOpacity = Math.max(0, Math.min(1, verticalOpacity));

    // Opacity Ngang (Horizontal Fade)
    const horizontalFadeRange = 0.25;
    let horizontalOpacity = 1.0;
    const distanceFromCenter = Math.abs(0.5 - normalizedY);
    const normalizedDistanceFromCenter = distanceFromCenter / 0.5;

    if (normalizedDistanceFromCenter > 1 - horizontalFadeRange) {
      horizontalOpacity =
        (1 - normalizedDistanceFromCenter) / horizontalFadeRange;
    }
    horizontalOpacity = Math.max(0.1, Math.min(1, horizontalOpacity));

    // Opacity tổng thể
    opacity = verticalOpacity * horizontalOpacity * baseOpacity;

    // --- Áp dụng ---
    scaledWidth = vaseWidth * scale;
    offsetX = (vaseWidth - scaledWidth) / 2;

    ctx.globalAlpha = opacity;
    (ctx as any).imageSmoothingQuality = "high";

    // Sử dụng patternCanvas mới với width đã giảm
    ctx.drawImage(
      patternCanvas,
      0,
      y,
      vaseWidth * repeatFactor, // Chiều rộng mới
      1,
      offsetX,
      y,
      scaledWidth,
      1
    );
  }

  ctx.globalAlpha = 1;
  return canvas;
};

// --- Các hàm khác không đổi (đã loại bỏ lighting/depth map tạm thời cho kiểm thử) ---
const createMaskFromAlpha = async (
  imagePath: string,
  width: number,
  height: number
): Promise<Buffer> => {
  const BLUR_AMOUNT = 5;
  try {
    const metadata = await sharp(imagePath).metadata();
    if (metadata.channels === 4 && metadata.hasAlpha) {
      console.log("✅ Sử dụng alpha channel làm mask");
      return await sharp(imagePath)
        .resize(width, height)
        .extractChannel("alpha")
        .blur(BLUR_AMOUNT)
        .toBuffer();
    } else {
      console.log("⚠️ Tạo mask từ brightness");
      return await sharp(imagePath)
        .resize(width, height)
        .greyscale()
        .normalise()
        .threshold(100)
        .blur(BLUR_AMOUNT)
        .toBuffer();
    }
  } catch (error) {
    console.error("❌ Lỗi tạo mask:", error);
    return await sharp({
      create: { width, height, channels: 1, background: 255 },
    } as any)
      .png()
      .toBuffer();
  }
};

const createLightingMap = async (
  // Tạm thời bỏ qua nếu không cần blend phức tạp
  templatePath: string,
  width: number,
  height: number
): Promise<Buffer> => {
  return sharp({
    create: { width, height, channels: 1, background: "white" }, // Trả về map trắng để không ảnh hưởng
  } as any).toBuffer();
};

const createDepthMap = async (
  // Tạm thời bỏ qua nếu không cần blend phức tạp
  templatePath: string,
  width: number,
  height: number,
  vaseShape: "round" | "cylinder"
): Promise<Buffer> => {
  return sharp({
    create: { width, height, channels: 1, background: "white" }, // Trả về map trắng để không ảnh hưởng
  } as any).toBuffer();
};

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

// --- ⚙️ Controller chính ---
export const renderPattern = async (req: Request, res: Response) => {
  try {
    const { patternBase64, templatePath } = req.body;
    if (!patternBase64 || !templatePath) {
      return res.status(400).json({ error: "Thiếu dữ liệu đầu vào" });
    }
    console.log(
      "🎨 Bắt đầu render pattern v27 (Round scale fixed to convex/phồng giữa)..."
    );
    console.log(`📐 Template: ${templatePath}`);
    const templateImg = await loadImage(templatePath);
    const width = templateImg.width;
    const height = templateImg.height;
    console.log(`📏 Kích thước: ${width}x${height}`);
    let patternBuffer: Buffer = Buffer.from(patternBase64, "base64");
    const metadata = await sharp(patternBuffer).metadata();
    if (!metadata.hasAlpha) {
      console.log("⚠️ Loại bỏ background trắng");
      patternBuffer = await removeWhiteBackground(patternBuffer, 240);
    }
    const patternBrightness = await getPatternBrightness(patternBuffer);
    const isDarkPattern = patternBrightness < 100;

    // Điều chỉnh pattern ban đầu (giữ tương đối đơn giản)
    patternBuffer = await sharp(patternBuffer)
      .modulate({ brightness: 1.1, saturation: 0.9 })
      .linear(1.1, -10)
      .toBuffer();
    const patternImg = await loadImage(patternBuffer);

    const templateNameMatch = Object.keys(VASE_SHAPE_MAP).find((key) =>
      templatePath.includes(key)
    );

    let vaseShape: "round" | "cylinder" = "cylinder";
    if (templateNameMatch) {
      vaseShape = VASE_SHAPE_MAP[templateNameMatch];
    } else if (Math.abs(width - height) < 50) {
      vaseShape = "round";
    }

    console.log(`🏺 Hình dạng gốm: ${vaseShape.toUpperCase()}`);
    console.log("🔄 Warping pattern đơn giản hóa...");
    const warpedCanvas = warpPatternAdvanced(
      patternImg,
      width,
      height,
      vaseShape
    );
    const warpedBuffer = warpedCanvas.toBuffer("image/png");

    console.log("🎭 Tạo mask (với blur giảm để giữ nét)...");
    const alphaMask = await createMaskFromAlpha(templatePath, width, height);

    // Tạm thời bỏ qua lighting map và depth map để kiểm tra hiệu ứng cơ bản
    // Nếu kết quả tốt, chúng ta có thể thêm lại chúng với blend mode phù hợp hơn
    // const lightingMap = await createLightingMap(templatePath, width, height);
    // const depthMap = await createDepthMap(templatePath, width, height, vaseShape);

    console.log("✂️ Áp dụng mask...");
    let maskedPattern = await sharp(warpedBuffer)
      .resize(width, height)
      .composite([{ input: alphaMask, blend: "dest-in" }])
      .toBuffer();

    console.log("🌈 Blend trực tiếp lên template...");
    // Với cách tiếp cận mới, chúng ta blend trực tiếp maskedPattern lên template
    // Sử dụng 'overlay' hoặc 'multiply' nếu muốn pattern tương tác với màu nền.
    // Nếu muốn pattern "phủ" lên, dùng 'over'.
    let blendMode: any = "overlay"; // Hoặc "over" nếu muốn pattern phủ lên hoàn toàn
    let postBrightness = 1.0;
    let postSaturation = 1.0;

    if (isDarkPattern) {
      blendMode = "overlay";
      postBrightness = 1.0;
      postSaturation = 1.0;
    }

    const finalResult = await sharp(templatePath)
      .composite([{ input: maskedPattern, blend: blendMode }])
      .modulate({ brightness: postBrightness, saturation: postSaturation })
      .sharpen(0.8, 0.5, 0.2) // Giảm sharpen nhẹ nhàng hơn một chút
      .toBuffer();

    const filename = `render_${Date.now()}.png`;
    const filePath = path.join(OUTPUT_DIR, filename);
    await fs.promises.writeFile(filePath, finalResult);
    console.log(`✅ Render hoàn tất: ${filename}`);
    console.log(`  Pattern type: ${isDarkPattern ? "Dark" : "Light"}`);
    console.log(`  Blend mode: ${blendMode}`);
    return res.status(200).json({
      message: "Render completed",
      resultUrl: `/render_output/${filename}`,
    });
  } catch (err: any) {
    console.error("❌ Render error:", err);
    return res.status(500).json({ error: err.message });
  }
};
