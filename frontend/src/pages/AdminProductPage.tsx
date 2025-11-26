import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaImage, FaEdit, FaTrash } from "react-icons/fa";
// Giả định đường dẫn đến Context xác thực của bạn là đúng
import { useAuth } from "../context/AuthContext"; 
import "../styles/AdminProduct.css";

// Đảm bảo biến môi trường này được định nghĩa chính xác
const API_URL = process.env.REACT_APP_API_URL;

const IconImage = FaImage as unknown as React.FC;
const IconEdit = FaEdit as unknown as React.FC;
const IconTrash = FaTrash as unknown as React.FC;

// --- INTERFACES ---

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  subImages?: string[];
  sku?: string;
  dimensions?: string;
  weight?: string;
  material?: string;
  origin?: string;
  availability?: string;
  story?: string;
  // Cho phép categoryId là null (không có danh mục)
  categoryId: number | string | null; 
  category?: Category;
}

// --- COMPONENT ---

const AdminProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();

  // Khởi tạo products LUÔN LÀ MẢNG rỗng để ngăn lỗi .map
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
    description: "",
    image: "",
    subImages: [],
    sku: "",
    dimensions: "",
    weight: "",
    material: "",
    origin: "",
    availability: "Sẵn hàng",
    story: "",
    categoryId: null, // Khởi tạo là null
  });

  const [subImg1, setSubImg1] = useState("");
  const [subImg2, setSubImg2] = useState("");
  const [subImg3, setSubImg3] = useState("");
  const [subImg4, setSubImg4] = useState("");

  const [editing, setEditing] = useState<boolean>(false);
  
  // --- LOGIC XÁC THỰC VÀ FETCH DATA ---
  
  useEffect(() => {
    // 1. Nếu Auth Context vẫn đang tải, chờ đợi
    if (isLoading) return;

    // 2. Kiểm tra xác thực/phân quyền: Nếu không phải Admin, chuyển hướng
    if (!user || !isAdmin) {
      // Chuyển hướng ngay lập tức và dừng lại
      navigate("/"); 
      return; 
    }
    
    // 3. Nếu là Admin và đã tải xong, tiến hành fetch data
    fetchProducts();
    fetchCategories();

  }, [user, isAdmin, isLoading, navigate]); // Dependencies đảm bảo chạy khi trạng thái thay đổi

  const fetchProducts = async () => {
    try {
      // Kiểm tra API_URL để tránh lỗi nếu biến môi trường bị thiếu
      if (!API_URL) throw new Error("API_URL is not defined.");
      
      const res = await axios.get<Product[]>(`${API_URL}/api/products`);
      
      // ✅ FIX: Đảm bảo dữ liệu nhận được là mảng. Bắt buộc dùng mảng rỗng nếu không phải.
      const data = (res.data && Array.isArray(res.data)) ? res.data : [];
      setProducts(data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      // Đảm bảo products là mảng rỗng khi có lỗi mạng/server
      setProducts([]); 
    }
  };

  const fetchCategories = async () => {
    try {
      if (!API_URL) throw new Error("API_URL is not defined.");
      const res = await axios.get<Category[]>(`${API_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };
  
  // --- LOGIC FORM ---

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Chuyển đổi giá và tồn kho sang dạng số
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // Đảm bảo rằng giá trị rỗng ("") được lưu là null
    setFormData((prev) => ({
      ...prev,
      categoryId: value === "" ? null : Number(value),
    }));
  };

  const handleEditClick = (product: Product) => {
    setEditing(true);
    setFormData({
      ...product,
      // Đảm bảo categoryId được xử lý đúng kiểu null/number
      categoryId: product.categoryId === undefined ? null : product.categoryId, 
    });
    const subs = product.subImages || [];
    setSubImg1(subs[0] || "");
    setSubImg2(subs[1] || "");
    setSubImg3(subs[2] || "");
    setSubImg4(subs[3] || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditing(false);
    setFormData({
      id: 0,
      name: "",
      price: 0,
      stock: 0,
      description: "",
      image: "",
      subImages: [],
      sku: "",
      dimensions: "",
      weight: "",
      material: "",
      origin: "",
      availability: "Sẵn hàng",
      story: "",
      categoryId: null,
    });
    setSubImg1("");
    setSubImg2("");
    setSubImg3("");
    setSubImg4("");
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const subImages = [subImg1, subImg2, subImg3, subImg4].filter(
      (img) => img.trim() !== ""
    );

    const payload = {
      ...formData,
      subImages,
      categoryId: formData.categoryId === "" ? null : formData.categoryId,
    };

    try {
      if (editing) {
        await axios.put(`${API_URL}/api/products/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Cập nhật thành công!");
      } else {
        await axios.post(`${API_URL}/api/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Thêm mới thành công!");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("❌ Có lỗi xảy ra! Vui lòng kiểm tra các trường bắt buộc.");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Xóa sản phẩm này sẽ không thể hoàn tác. Bạn chắc chắn chứ?"
      )
    )
      return;
    try {
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Đã xóa sản phẩm thành công!");
      fetchProducts();
    } catch (e) {
      console.error(e);
      alert("Lỗi xóa sản phẩm!");
    }
  };

  // --- RENDER ---
  
  // Hiển thị trạng thái tải trong lúc Auth Context đang kiểm tra
  if (isLoading) return <div className="p-10 text-center">Đang kiểm tra quyền truy cập...</div>;

  return (
    <div className="admin-page">
      <h2 className="admin-title">Quản lý sản phẩm</h2>

      {/* --- PHẦN FORM NHẬP LIỆU --- */}
      <div className="product-form-container">
        <h3 className="form-title">
          {editing ? "✏️ Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h3>

        <div className="form-grid">
          <div className="form-column">
            <label>Tên sản phẩm (*)</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên..."
            />

            <div className="row-2">
              <div>
                <label>Mã SP (SKU)</label>
                <input
                  name="sku"
                  value={formData.sku || ""}
                  onChange={handleChange}
                  placeholder="MG-001"
                />
              </div>
              <div>
                <label>Tình trạng</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                >
                  <option value="Sẵn hàng">Sẵn hàng</option>
                  <option value="Hết hàng">Hết hàng</option>
                  <option value="Đặt trước">Đặt trước</option>
                </select>
              </div>
            </div>

            <div className="row-2">
              <div>
                <label>Giá (VNĐ)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Tồn kho</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* DROPDOWN CHỌN DANH MỤC */}
            <div style={{ marginTop: "15px" }}>
              <label>Danh mục sản phẩm</label>
              <select
                name="categoryId"
                // Hiển thị null là chuỗi rỗng để chọn option "Không phân loại"
                value={formData.categoryId === null ? "" : formData.categoryId} 
                onChange={handleCategoryChange} 
              >
                <option value="">-- Không phân loại --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <small
                  style={{ color: "red", display: "block", marginTop: "5px" }}
                >
                  Chưa có danh mục nào.
                </small>
              )}
            </div>
          </div>

          <div className="form-column">
            <label>Ảnh chính (URL) (*)</label>
            <div className="input-with-icon">
              <input
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="/public/images/abc.jpg"
              />
              <label className="icon-label">
                <IconImage />
              </label>
            </div>

            <label>Ảnh phụ (Gallery)</label>
            <div className="sub-images-grid">
              <input
                placeholder="Ảnh phụ 1"
                value={subImg1}
                onChange={(e) => setSubImg1(e.target.value)}
              />
              <input
                placeholder="Ảnh phụ 2"
                value={subImg2}
                onChange={(e) => setSubImg2(e.target.value)}
              />
              <input
                placeholder="Ảnh phụ 3"
                value={subImg3}
                onChange={(e) => setSubImg3(e.target.value)}
              />
              <input
                placeholder="Ảnh phụ 4"
                value={subImg4}
                onChange={(e) => setSubImg4(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Thông số & Nội dung */}
        <div className="specs-section">
          <h4>🛠️ Thông số kỹ thuật</h4>
          <div className="specs-grid">
            <input
              name="dimensions"
              value={formData.dimensions || ""}
              onChange={handleChange}
              placeholder="Kích thước"
            />
            <input
              name="weight"
              value={formData.weight || ""}
              onChange={handleChange}
              placeholder="Trọng lượng"
            />
            <input
              name="material"
              value={formData.material || ""}
              onChange={handleChange}
              placeholder="Chất liệu"
            />
            <input
              name="origin"
              value={formData.origin || ""}
              onChange={handleChange}
              placeholder="Xuất xứ"
            />
          </div>
        </div>

        <div className="content-section">
          <label>Mô tả ngắn</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
          />
          <label>Câu chuyện sản phẩm</label>
          <textarea
            name="story"
            value={formData.story || ""}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="form-buttons">
          <button className="save-btn" onClick={handleSubmit}>
            {editing ? "Lưu thay đổi" : "Thêm mới"}
          </button>
          {editing && (
            <button className="cancel-btn" onClick={resetForm}>
              Hủy bỏ
            </button>
          )}
        </div>
      </div>

      {/* --- PHẦN DANH SÁCH SẢN PHẨM --- */}
      <div className="product-list-section">
        <div className="product-list"></div>
        <div className="list-header-wrapper">
          <h3>📋 Danh sách sản phẩm ({products.length})</h3>
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên & SKU</th>
              <th>Danh mục</th>
              <th>Giá & Kho</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {/* ✅ FIX LỖI: Kiểm tra Array.isArray(products) để chặn lỗi tuyệt đối */}
            {Array.isArray(products) && products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img src={p.image} alt={p.name} className="table-img" />
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    <br />
                    <small className="sku-text">{p.sku || "---"}</small>
                  </td>
                  <td>
                    <span className="category-badge">
                      {p.category?.name || "Chưa phân loại"}
                    </span>
                  </td>
                  <td>
                    {p.price.toLocaleString()} đ
                    <br />
                    <small>Kho: {p.stock}</small>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(p)}
                    >
                      <IconEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p.id)}
                    >
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  {/* Hiển thị thông báo khi không có sản phẩm sau khi tải xong */}
                  {products.length === 0
                    ? "Không có sản phẩm nào được tìm thấy."
                    : "Đang tải dữ liệu sản phẩm..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductPage;