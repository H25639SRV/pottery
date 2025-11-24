import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ------------------------------------------------------------------
// ✅ Lấy tất cả sản phẩm
// ------------------------------------------------------------------
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "desc" }, // Sản phẩm mới nhất lên đầu
      include: {
        category: true, // 🆕 Lấy kèm thông tin danh mục (tên, id)
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm", error });
  }
};

// ------------------------------------------------------------------
// ✅ Lấy chi tiết 1 sản phẩm
// ------------------------------------------------------------------
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true, // 🆕 Lấy kèm thông tin danh mục
      },
    });

    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy sản phẩm", error });
  }
};

// ------------------------------------------------------------------
// ✅ Thêm sản phẩm (ADMIN)
// ------------------------------------------------------------------
export const createProduct = async (req: Request, res: Response) => {
  const {
    name,
    description = "Đang cập nhật...",
    price,
    image = "https://via.placeholder.com/300",
    stock,
    subImages,
    // 🆕 Các trường mới
    story,
    sku,
    dimensions,
    weight,
    material,
    origin,
    availability,
    categoryId, // ID danh mục
  } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        stock: stock ? Number(stock) : 0,
        subImages: Array.isArray(subImages) ? subImages : [], // Đảm bảo là mảng

        // 🆕 Lưu các thông số kỹ thuật & nội dung
        story: story || "",
        sku: sku || "",
        dimensions: dimensions || "",
        weight: weight || "",
        material: material || "",
        origin: origin || "",
        availability: availability || "Sẵn hàng",

        // 🆕 Liên kết danh mục (Nếu có chọn)
        categoryId: categoryId ? Number(categoryId) : null,
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Lỗi tạo sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi thêm sản phẩm", error });
  }
};

// ------------------------------------------------------------------
// ✅ Cập nhật sản phẩm
// ------------------------------------------------------------------
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const {
    name,
    description,
    price,
    image,
    stock,
    subImages,
    story,
    sku,
    dimensions,
    weight,
    material,
    origin,
    availability,
    categoryId,
  } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        stock: stock ? Number(stock) : undefined,
        subImages: Array.isArray(subImages) ? subImages : undefined,

        // 🆕 Cập nhật các trường mới
        story,
        sku,
        dimensions,
        weight,
        material,
        origin,
        availability,

        // 🆕 Cập nhật danh mục
        categoryId: categoryId ? Number(categoryId) : null,
      },
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm", error });
  }
};

// ------------------------------------------------------------------
// ✅ Xóa sản phẩm
// ------------------------------------------------------------------
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const productId = Number(id);

    // 1. Xóa các item trong giỏ hàng liên quan đến sản phẩm này trước
    // (Tránh lỗi khóa ngoại Foreign Key)
    await prisma.cartItem.deleteMany({ where: { productId: productId } });

    // Lưu ý: Nếu có bảng OrderItem (đơn hàng đã mua), bạn có thể cần xử lý thêm
    // hoặc để nguyên nếu muốn giữ lịch sử đơn hàng (cần cấu hình onDelete: SetNull ở Schema)

    // 2. Xóa sản phẩm
    await prisma.product.delete({ where: { id: productId } });

    res.json({ message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error });
  }
};
