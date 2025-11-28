// customOrderController.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
// ❌ ĐÃ XÓA: Import CustomOrderRequestStatus bị lỗi vì nó không tồn tại trong schema.
// Nếu muốn giữ kiểu an toàn, bạn có thể tự định nghĩa kiểu bên ngoài.

const prisma = new PrismaClient();

// Định nghĩa kiểu dữ liệu cho trạng thái thủ công (vì schema dùng String)
type CustomRequestStatusString = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

// ==================================================================
// 1️⃣ CLIENT: TẠO YÊU CẦU CUSTOM MỚI
// ==================================================================
export const createCustomRequest = async (req: Request, res: Response) => {
  try {
    console.log("📥 Đang xử lý yêu cầu tạo đơn hàng custom...");

    // --- BƯỚC 1: LẤY VÀ XỬ LÝ USER ID ---
    const userDecoded = (req as any).user;
    const rawUserId = userDecoded?.id || userDecoded?.userId || req.body.userId;
    const userId = parseInt(String(rawUserId), 10);

    if (isNaN(userId)) {
      console.error("❌ Lỗi: User ID không hợp lệ:", rawUserId);
      return res
        .status(401)
        .json({
          error: "Không xác định được người dùng. Vui lòng đăng nhập lại.",
        });
    }

    // --- BƯỚC 2: NHẬN DỮ LIỆU TỪ FRONTEND ---
    const { 
      vaseName, 
      patternFile, 
      resultImage, 
      address, 
      paymentMethod 
    } = req.body;

    // Validate dữ liệu cơ bản
    if (!resultImage) {
      return res
        .status(400)
        .json({ error: "Không tìm thấy ảnh đã render (resultImage)" });
    }

    if (!address || typeof address !== 'string' || address.trim().length < 10) {
      return res.status(400).json({ error: "Địa chỉ giao hàng là bắt buộc và cần chi tiết." });
    }

    // --- BƯỚC 3: TẠO YÊU CẦU CUSTOM VÀO DB ---
    const newRequest = await prisma.customOrderRequest.create({
      data: {
        userId: userId, 
        vaseName: vaseName || "Sản phẩm tùy chỉnh",
        patternFile: patternFile || "unknown_pattern",
        resultImage: resultImage,
        // ✅ SỬ DỤNG CHUỖI LITERAL. PHẢI ĐỒNG BỘ VỚI @default("PENDING") trong schema.
        status: "PENDING", 

        // LƯU TRƯỜNG ĐỒNG BỘ VỚI ORDER
        address: address.trim(),
        paymentMethod: paymentMethod || "cod",
      },
    });

    console.log(
      `✅ Tạo yêu cầu Custom thành công! ID: ${newRequest.id} - Payment: ${newRequest.paymentMethod}`
    );
    res.status(201).json(newRequest);
  } catch (error: any) {
    console.error("❌ Lỗi SERVER khi tạo yêu cầu Custom:", error);
    res.status(500).json({
      error: "Lỗi nội bộ server khi tạo yêu cầu Custom.",
      details: error.message,
    });
  }
};

// ==================================================================
// 2️⃣ ADMIN: LẤY TẤT CẢ YÊU CẦU CUSTOM
// ==================================================================
export const getAllCustomRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.customOrderRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    res.status(200).json(requests);
  } catch (error: any) {
    console.error("❌ Lỗi lấy danh sách yêu cầu Custom:", error);
    res
      .status(500)
      .json({ error: "Lỗi khi lấy danh sách yêu cầu Custom: " + error.message });
  }
};

// ==================================================================
// 3️⃣ ADMIN: CẬP NHẬT TRẠNG THÁI YÊU CẦU CUSTOM
// ==================================================================
export const updateCustomRequestStatus = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { status, adminNotes } = req.body; 

  const parsedRequestId = parseInt(requestId);
  if (isNaN(parsedRequestId)) {
    return res.status(400).json({ error: "ID yêu cầu không hợp lệ." });
  }

  if (!status) {
    return res
      .status(400)
      .json({ error: "Cần cung cấp trạng thái mới (status)" });
  }

  try {
    const updatedRequest = await prisma.customOrderRequest.update({
      where: { id: parsedRequestId },
      data: { 
        // ✅ status là string, không cần cast nếu type của req.body.status là string.
        // Tuy nhiên, có thể cast để đảm bảo type check nếu cần.
        status: status as string, 
        adminNotes: adminNotes, 
      },
    });

    console.log(`🔄 Đã cập nhật Yêu cầu Custom #${requestId} sang trạng thái: ${status}`);
    res.status(200).json(updatedRequest);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: `Không tìm thấy Yêu cầu Custom với ID: ${requestId}` });
    }
    console.error("❌ Lỗi cập nhật trạng thái Yêu cầu Custom:", error);
    res
      .status(500)
      .json({ error: "Lỗi khi cập nhật yêu cầu Custom: " + error.message });
  }
};