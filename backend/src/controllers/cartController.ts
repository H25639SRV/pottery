import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ------------------------------------------------------------------
// 🧩 Lấy giỏ hàng (POST /api/cart/get-cart)
// ------------------------------------------------------------------
export const getCart = async (req: Request, res: Response) => {
  try {
    // Lấy userId từ body (vì dùng method POST)
    const userId = Number(req.body.userId);

    console.log("🟢 [getCart] Request for userId:", userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId provided" });
    }

    // 🛡️ BẢO VỆ: Kiểm tra User có tồn tại không
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      console.warn(`⚠️ [getCart] User ID ${userId} not found in DB.`);
      return res
        .status(404)
        .json({ error: "User not found. Please logout and login again." });
    }

    // Tìm giỏ hàng
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: true }, // Kèm thông tin sản phẩm (ảnh, giá...)
          orderBy: { id: "asc" }, // Sắp xếp item theo thứ tự thêm vào
        },
      },
    });

    // Nếu chưa có giỏ hàng -> Tạo mới
    if (!cart) {
      console.log(`🆕 [getCart] Creating new cart for userId: ${userId}`);
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    res.json(cart);
  } catch (error: any) {
    console.error("❌ [getCart] Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error while fetching cart" });
  }
};

// ------------------------------------------------------------------
// 🧩 Thêm sản phẩm vào giỏ (POST /api/cart/add)
// ------------------------------------------------------------------
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body.userId);
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity) || 1;

    console.log(
      `➕ [addToCart] User: ${userId}, Product: ${productId}, Qty: ${quantity}`
    );

    if (!userId || isNaN(userId))
      return res.status(400).json({ error: "Invalid userId" });
    if (!productId || isNaN(productId))
      return res.status(400).json({ error: "Invalid productId" });

    // 🛡️ BẢO VỆ 1: Check User
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(404).json({ error: "User not found in Database" });
    }

    // 🛡️ BẢO VỆ 2: Check Product
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!productExists) {
      return res.status(404).json({ error: "Product not found in Database" });
    }

    // 1. Tìm hoặc Tạo giỏ hàng
    let cart = await prisma.cart.findFirst({ where: { userId } });

    if (!cart) {
      try {
        cart = await prisma.cart.create({ data: { userId } });
      } catch (dbError: any) {
        // Bắt lỗi nếu userId không hợp lệ ở cấp độ DB
        if (dbError.code === "P2003") {
          return res
            .status(400)
            .json({ error: "Foreign key constraint failed: Invalid User ID" });
        }
        throw dbError;
      }
    }

    // 2. Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (existingItem) {
      // Nếu có rồi -> Cộng dồn số lượng
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      console.log(
        `🔄 [addToCart] Increased quantity for item ${existingItem.id}`
      );
    } else {
      // Nếu chưa có -> Tạo item mới
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
      });
      console.log(`✅ [addToCart] Added new item to cart ${cart.id}`);
    }

    // 3. Trả về giỏ hàng mới nhất để Frontend cập nhật ngay
    const updatedCart = await prisma.cart.findFirst({
      where: { id: cart.id },
      include: {
        items: { include: { product: true }, orderBy: { id: "asc" } },
      },
    });

    res.json(updatedCart);
  } catch (error: any) {
    console.error("❌ [addToCart] Critical Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error while adding to cart" });
  }
};

// ------------------------------------------------------------------
// 🧩 Xóa sản phẩm khỏi giỏ (POST /api/cart/remove)
// ------------------------------------------------------------------
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body.userId);
    const productId = Number(req.body.productId);

    console.log(`🗑️ [removeFromCart] User: ${userId}, Product: ${productId}`);

    if (!userId || isNaN(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    // Xóa item khớp với cartId và productId
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    // Trả về giỏ hàng mới
    const updatedCart = await prisma.cart.findFirst({
      where: { id: cart.id },
      include: {
        items: { include: { product: true }, orderBy: { id: "asc" } },
      },
    });

    res.json(updatedCart);
  } catch (error: any) {
    console.error("❌ [removeFromCart] Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ------------------------------------------------------------------
// 🧩 Thanh toán: Tạo Đơn Hàng -> Xóa Giỏ Hàng
export const checkoutCart = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body.userId);
    console.log(`💸 [checkoutCart] Processing for User: ${userId}`);

    if (!userId || isNaN(userId))
      return res.status(400).json({ error: "Invalid userId" });

    // 1. Tìm giỏ hàng và các món trong đó
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or not found" });
    }

    // 2. Tính tổng tiền đơn hàng
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // 3. TẠO ĐƠN HÀNG (ORDER) MỚI VÀO DB
    // Lưu ý: Model Prisma của bạn phải có bảng Order và OrderItem
    const newOrder = await prisma.order.create({
      data: {
        userId: userId,
        total: totalAmount,
        status: "PENDING", // Trạng thái mặc định: Chờ xử lý
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // Lưu giá tại thời điểm mua
          })),
        },
      },
    });

    console.log(
      `✅ [checkoutCart] Created Order #${newOrder.id} for User ${userId}`
    );

    // 4. Xóa sạch giỏ hàng sau khi đã tạo đơn thành công
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.json({ message: "Checkout successful", orderId: newOrder.id });
  } catch (error: any) {
    console.error("❌ [checkoutCart] Error:", error);
    res.status(500).json({ error: "Internal Server Error during checkout" });
  }
};
