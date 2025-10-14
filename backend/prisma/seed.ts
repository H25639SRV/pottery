// // backend/prisma/seed.ts
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

// async function main() {
//   // xóa dữ liệu cũ an toàn (cẩn thận nếu có dữ liệu muốn giữ)
//   await prisma.cartItem.deleteMany();
//   await prisma.cart.deleteMany();
//   await prisma.product.deleteMany();
//   await prisma.user.deleteMany();

//   const hashed = await bcrypt.hash("11111", 10);

//   // tạo admin và guest với username
//   const admin = await prisma.user.create({
//     data: {
//       username: "H25639SRV",
//       email: "h25639srv@gmail.com",
//       password: hashed,
//       role: "ADMIN",
//     },
//   });

//   const guest = await prisma.user.create({
//     data: {
//       username: "guest",
//       email: "toilagay@gmail.com",
//       password: hashed,
//       role: "USER",
//     },
//   });

//   // tạo 1 product mẫu
//   await prisma.product.create({
//     data: {
//       name: "Bình Gốm Trắng",
//       description: "Bình gốm trang trí handmade, đường kính 12cm.",
//       price: 25.5,
//       image: null,
//       stock: 10,
//       userId: admin.id, // optional
//     },
//   });

//   // tạo cart cho guest
//   await prisma.cart.create({
//     data: {
//       userId: guest.id,
//     },
//   });

//   console.log("Seeding completed.");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
