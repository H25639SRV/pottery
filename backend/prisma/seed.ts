import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Mã hoá mật khẩu
  const passwordAdmin = await bcrypt.hash("11111", 10);
  const passwordGuest = await bcrypt.hash("11111", 10);

  // Xoá toàn bộ dữ liệu cũ
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  // Tạo tài khoản admin
  const admin = await prisma.user.create({
    data: {
      email: "h25639srv@gmail.com",
      password: passwordAdmin,
      role: "ADMIN", // nhớ có field này trong schema.prisma
    },
  });

  // Tạo tài khoản khách
  const guest = await prisma.user.create({
    data: {
      email: "toilagay@gmail.com",
      password: passwordGuest,
      role: "USER",
    },
  });

  console.log("✅ Seed thành công!");
  console.log("Admin:", admin.email);
  console.log("Guest:", guest.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
