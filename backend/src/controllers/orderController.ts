import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==================================================================
// 1️⃣ CLIENT: TẠO ĐƠN HÀNG MỚI (Có Address & Payment)
// ==================================================================
export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log("📥 Đang xử lý yêu cầu tạo đơn hàng...");

    // --- BƯỚC 1: LẤY VÀ XỬ LÝ USER ID (FIX LỖI KIỂU DỮ LIỆU) ---
    // Middleware xác thực thường gán user vào req.user
    const userDecoded = (req as any).user;

    // Lấy ID dù nó nằm ở đâu (req.user.id, req.user.userId hoặc req.body)
    const rawUserId = userDecoded?.id || userDecoded?.userId || req.body.userId;

    // QUAN TRỌNG: Ép kiểu sang Số nguyên (Integer) để tránh lỗi Prisma
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
    const { items, total, address, paymentMethod } = req.body;

    // Validate dữ liệu cơ bản
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Giỏ hàng trống hoặc không hợp lệ" });
    }

    if (!address) {
      return res.status(400).json({ error: "Địa chỉ giao hàng là bắt buộc" });
    }

    // --- BƯỚC 3: TẠO ĐƠN HÀNG VÀO DB ---
    const newOrder = await prisma.order.create({
      data: {
        userId: userId, // Đã là số Int
        total: parseFloat(total), // Đảm bảo là số Float
        status: "PENDING", // Mặc định là Chờ xử lý

        // Lưu thông tin mới thêm
        address: address,
        paymentMethod: paymentMethod || "cod", // Mặc định là COD nếu không có

        // Lưu danh sách sản phẩm (Nested Write)
        items: {
          create: items.map((item: any) => ({
            productId: Number(item.product.id), // Đảm bảo ID sản phẩm là số
            quantity: Number(item.quantity), // Đảm bảo số lượng là số
            price: parseFloat(item.product.price), // Lưu giá tại thời điểm mua

            // Xử lý sản phẩm Custom (nếu có)
            isCustom: item.product.isCustom || false,
            customImage: item.product.customImage || null,
          })),
        },
      },
    });

    console.log(
      `✅ Tạo đơn hàng thành công! ID: ${newOrder.id} - Payment: ${newOrder.paymentMethod}`
    );
    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error("❌ Lỗi SERVER khi tạo đơn hàng:", error);
    // Trả về lỗi 500 kèm chi tiết để dễ debug
    res.status(500).json({
      error: "Lỗi nội bộ server khi tạo đơn hàng.",
      details: error.message,
    });
  }
};

// ==================================================================
// 2️⃣ ADMIN: LẤY TẤT CẢ ĐƠN HÀNG
// ==================================================================
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" }, // Đơn mới nhất lên đầu
      include: {
        // Lấy thông tin người đặt
        user: {
          select: { id: true, username: true, email: true },
        },
        // Lấy chi tiết sản phẩm trong đơn
        items: {
          include: {
            product: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    // Lưu ý: address và paymentMethod là trường của bảng Order
    // nên Prisma tự động lấy, không cần include.

    res.status(200).json(orders);
  } catch (error: any) {
    console.error("❌ Lỗi lấy danh sách đơn hàng:", error);
    res
      .status(500)
      .json({ error: "Lỗi khi lấy danh sách đơn hàng: " + error.message });
  }
};

// ==================================================================
// 3️⃣ ADMIN: CẬP NHẬT TRẠNG THÁI ĐƠN (Duyệt đơn)
// ==================================================================
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body; // Ví dụ: "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"

  if (!status) {
    return res
      .status(400)
      .json({ error: "Cần cung cấp trạng thái mới (status)" });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: status },
    });

    console.log(`🔄 Đã cập nhật đơn #${orderId} sang trạng thái: ${status}`);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    console.error("❌ Lỗi cập nhật trạng thái:", error);
    res
      .status(500)
      .json({ error: "Lỗi khi cập nhật đơn hàng: " + error.message });
  }
};
