// src/controllers/cartController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🧩 Lấy giỏ hàng của user
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    console.log("🟢 [getCart] userId =", userId, "typeof:", typeof userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // chắc chắn user tồn tại
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    console.log("📦 [getCart] cart found:", cart ? cart.id : "none");

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
      console.log("🆕 [getCart] created new cart:", cart.id);
    }

    res.json(cart);
  } catch (error: any) {
    console.error("❌ [getCart] error:", error.message || error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// 🧩 Thêm sản phẩm vào giỏ
export const addToCart = async (req: Request, res: Response) => {
  try {
    // ép kiểu number phòng trường hợp client gửi chuỗi
    const userId = Number(req.body.userId);
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity) || 1;

    console.log("🟢 [addToCart] payload:", { userId, productId, quantity });

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid or missing userId" });
    }
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: "Invalid or missing productId" });
    }

    // kiểm tra user tồn tại
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // kiểm tra product tồn tại
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // tìm hoặc tạo cart cho user
    let cart = await prisma.cart.findFirst({ where: { userId } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
      console.log("🆕 [addToCart] created cart id:", cart.id);
    }

    // tìm item đã có
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      console.log("🔁 [addToCart] updated item:", updated.id);
    } else {
      const created = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
      console.log("➕ [addToCart] created item:", created.id);
    }

    const updatedCart = await prisma.cart.findFirst({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    res.json(updatedCart);
  } catch (error: any) {
    console.error("❌ [addToCart] error:", error.message || error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// 🧩 Xóa sản phẩm khỏi giỏ
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body.userId);
    const productId = Number(req.body.productId);

    console.log("🟢 [removeFromCart] payload:", { userId, productId });

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid or missing userId" });
    }
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: "Invalid or missing productId" });
    }

    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    const updatedCart = await prisma.cart.findFirst({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    res.json(updatedCart);
  } catch (error: any) {
    console.error("❌ [removeFromCart] error:", error.message || error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
// 🧩 Thanh toán giỏ hàng (checkout)
export const checkoutCart = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body.userId);
    console.log("🟢 [checkoutCart] payload:", { userId });

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid or missing userId" });
    }

    // kiểm tra user tồn tại
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // tìm giỏ hàng
    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // xóa toàn bộ item trong giỏ (coi như checkout)
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // có thể mở rộng để tạo đơn hàng thực tế ở đây
    console.log("✅ [checkoutCart] Cart cleared after checkout:", cart.id);

    res.json({ message: "Checkout successful" });
  } catch (error: any) {
    console.error("❌ [checkoutCart] error:", error.message || error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
