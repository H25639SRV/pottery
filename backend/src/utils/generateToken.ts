import jwt from "jsonwebtoken";

export const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!, // phải dùng cùng secret
    { expiresIn: "7d" }
  );
};
