import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Khách hàng: Gửi yêu cầu custom
export const createCustomRequest = async (req: Request, res: Response) => {
  // --- [PHỤC HỒI USERID] ---
  // @ts-ignore
  const user = req.user; // @ts-ignore
  const userIdFromReq = req.userId;

  const userId = userIdFromReq || user?.userId; // --- [KẾT THÚC PHỤC HỒI] --- // [ĐÃ SỬA]: Chỉ lấy các trường cần thiết (vaseName, patternFile, resultImage)
  const { vaseName, patternFile, resultImage } = req.body;

  if (!userId || !resultImage) {
    // Ghi log lỗi cụ thể hơn
    console.error("❌ Lỗi tạo custom request: Thiếu userId hoặc resultImage.", {
      userId: userId,
      resultImage: !!resultImage,
    });
    return res.status(400).json({
      error: "Thiếu thông tin yêu cầu (userId hoặc resultImage)",
    });
  }

  try {
    const request = await prisma.customOrderRequest.create({
      data: {
        userId: parseInt(userId), // [ĐÃ XÓA]: baseProductId không còn trong schema và không cần truyền
        vaseName: vaseName || "render.png",
        patternFile: patternFile || "unknown",
        resultImage: resultImage,
        status: "PENDING",
      },
    });
    res.status(201).json({ message: "Đã gửi yêu cầu thành công", request });
  } catch (error: any) {
    console.error("❌ Lỗi khi tạo yêu cầu custom:", error);
    // [ĐÃ XÓA]: Logic xử lý lỗi P2003 (Khóa ngoại) không còn cần thiết
    res.status(500).json({ error: "Lỗi khi tạo yêu cầu: " + error.message });
  }
};

// Admin: Xem tất cả yêu cầu custom
export const getAllCustomRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.customOrderRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
        // [ĐÃ XÓA]: Không còn include product vì đã loại bỏ liên kết
      },
    });
    res.status(200).json(requests);
  } catch (error: any) {
    res.status(500).json({ error: "Lỗi khi lấy yêu cầu: " + error.message });
  }
};

// Admin: Cập nhật trạng thái yêu cầu (Duyệt/Từ chối)
export const updateCustomRequestStatus = async (
  req: Request,
  res: Response
) => {
  const { requestId } = req.params;
  const { status, adminNotes } = req.body; // "APPROVED", "REJECTED"

  if (!status) {
    return res.status(400).json({ error: "Thiếu trạng thái" });
  }

  try {
    const updatedRequest = await prisma.customOrderRequest.update({
      where: { id: parseInt(requestId) },
      data: {
        status: status,
        adminNotes: adminNotes,
      },
    });
    res.status(200).json(updatedRequest);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Lỗi khi cập nhật yêu cầu: " + error.message });
  }
};
