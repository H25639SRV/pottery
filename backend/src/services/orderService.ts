// import prisma from "../db";
// import { Prisma, Product } from "@prisma/client";

// // Định nghĩa lại type CartItemWithProduct
// type CartItemWithProduct = Prisma.CartItemGetPayload<{
//   include: { product: true };
// }>;

// export async function createOrderFromCart(userId: number) {
//   const cart = await prisma.cart.findUnique({
//     where: { userId },
//     include: { items: { include: { product: true } } },
//   });

//   if (!cart || cart.items.length === 0) {
//     throw new Error("Cart is empty or not found");
//   }

//   const items = cart.items as CartItemWithProduct[];

//   const order = await prisma.order.create({
//     data: {
//       userId,
//       items: {
//         create: items.map((it) => ({
//           productId: it.productId,
//           quantity: it.quantity,
//           price: it.product.price,
//         })),
//       },
//     },
//     include: { items: { include: { product: true } } },
//   });

//   await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
//   await prisma.cart.delete({ where: { id: cart.id } });

//   return order;
// }

// export async function getOrdersByUser(userId: number) {
//   return prisma.order.findMany({
//     where: { userId },
//     include: { items: { include: { product: true } } },
//   });
// }
