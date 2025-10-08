import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import { Request, Response } from "express";

// Khởi tạo Prisma Client
const prisma = new PrismaClient();

// Hàm tiện ích để loại bỏ các trường nhạy cảm trước khi trả về
const sanitizeUser = (user: any) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// ---

/**
 * 🔹 Đăng ký tài khoản
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    // 1. Kiểm tra thiếu thông tin
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({
          message: "Vui lòng nhập đầy đủ tên người dùng, email và mật khẩu!",
        });
    }

    // 2. Kiểm tra email đã tồn tại
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email này đã được đăng ký!" });
    }

    // 3. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Tạo người dùng mới (Lỗi về username sẽ biến mất sau khi chạy 'npx prisma generate')
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || "USER", // Mặc định là 'USER' nếu không cung cấp
      },
    });

    // 5. Sinh token JWT
    const token = generateToken(newUser.id.toString(), newUser.role);

    // 6. Trả về phản hồi thành công
    return res.status(201).json({
      message: "Đăng ký thành công!",
      token,
      user: sanitizeUser(newUser), // Loại bỏ mật khẩu trước khi trả về
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi máy chủ trong quá trình đăng ký." });
  }
};

// ---

/**
 * 🔹 Đăng nhập
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm người dùng theo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({
          message:
            "Thông tin đăng nhập không hợp lệ (Email hoặc mật khẩu không đúng).",
        });
    }

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({
          message:
            "Thông tin đăng nhập không hợp lệ (Email hoặc mật khẩu không đúng).",
        });
    }

    // 3. Sinh token JWT
    const token = generateToken(user.id.toString(), user.role);

    // 4. Trả về phản hồi thành công
    return res.json({
      message: "Đăng nhập thành công!",
      token,
      user: sanitizeUser(user), // Loại bỏ mật khẩu trước khi trả về
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi máy chủ trong quá trình đăng nhập." });
  }
};
