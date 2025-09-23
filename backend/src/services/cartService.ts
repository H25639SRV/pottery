// src/services/cartService.ts
import prisma from "../db";

export const getCartByUser = async (userId: number) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
};

export const createCartForUser = async (userId: number) => {
  return prisma.cart.create({ data: { userId } });
};

export const addOrUpdateCartItem = async (
  userId: number,
  productId: number,
  quantity: number
) => {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await createCartForUser(userId);
  }

  // upsert by unique composite (cartId + productId). You must have unique constraint in Prisma schema:
  // @@unique([cartId, productId]) on CartItem model (or use find+create/update)
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { product: true },
    });
  } else {
    return prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
      include: { product: true },
    });
  }
};

export const removeCartItem = async (itemId: number) => {
  return prisma.cartItem.delete({ where: { id: itemId } });
};

export const clearCartById = async (cartId: number) => {
  return prisma.cartItem.deleteMany({ where: { cartId } });
};
