import React, { useEffect, useState } from "react";
// Giữ lại AxiosError để xử lý lỗi mạng
import axios, { AxiosError } from "axios"; 
import { useNavigate } from "react-router-dom";
// Import toàn bộ module FAIcons
import * as FAIcons from "react-icons/fa"; 
import { useAuth } from "../context/AuthContext"; 
import "../styles/AdminProduct.css";

// 💡 FIX LỖI TS2786 BẰNG CÁCH ÉP KIỂU SAU KHI IMPORT
// Điều này giúp TypeScript nhận ra các icon là component hợp lệ trong JSX
const IconImage: React.FC = FAIcons.FaImage as any;
const IconEdit: React.FC = FAIcons.FaEdit as any;
const IconTrash: React.FC = FAIcons.FaTrash as any;

const API_URL = process.env.REACT_APP_API_URL;

// --- INTERFACES (Giao diện dữ liệu) ---

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
  subImages: string[]; 
  sku: string;
  dimensions: string;
  weight: string;
  material: string;
  origin: string;
  availability: string;
  story: string;
  categoryId: number | null; 
  category?: Category; 
}

// --- GIÁ TRỊ FORM BAN ĐẦU ---

const initialFormData: Product = {
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
};


// --- COMPONENT CHÍNH ---

const AdminProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth(); 

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Product>(initialFormData);

  const [subImgUrls, setSubImgUrls] = useState(["", "", "", ""]);
  const [editing, setEditing] = useState<boolean>(false);
  
  // --- FETCH DATA LOGIC ---
  
  const fetchProducts = async () => {
    if (!API_URL) {
      console.error("Lỗi: API_URL chưa được định nghĩa.");
      return;
    }

    try {
      const res = await axios.get<Product[]>(`${API_URL}/api/products`);
      
      const data = (res.data && Array.isArray(res.data)) ? res.data : [];
      setProducts(data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      setProducts([]); 
    }
  };

  const fetchCategories = async () => {
    if (!API_URL) return;

    try {
      const res = await axios.get<Category[]>(`${API_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };
  
  useEffect(() => {
    if (isLoading) return; 

    if (!user || !isAdmin) {
      navigate("/"); 
      return; 
    }
    
    fetchProducts();
    fetchCategories();

  }, [user, isAdmin, isLoading, navigate]);

  
  // --- FORM HANDLERS ---

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      categoryId: value === "" ? null : Number(value),
    }));
  };

  const handleSubImgUrlChange = (index: number, value: string) => {
    setSubImgUrls(prev => {
      const newUrls = [...prev];
      newUrls[index] = value;
      return newUrls;
    });
  };

  const resetForm = () => {
    setEditing(false);
    setFormData(initialFormData);
    setSubImgUrls(["", "", "", ""]); 
  };

  const handleEditClick = (product: Product) => {
    setEditing(true);
    
    const subs = product.subImages || [];
    
    setFormData({
      ...product,
      categoryId: product.categoryId || null, 
      subImages: subs, 
    });

    setSubImgUrls([
      subs[0] || "",
      subs[1] || "",
      subs[2] || "",
      subs[3] || ""
    ]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("❌ Lỗi xác thực: Không tìm thấy Token.");
        return;
    }
    if (!API_URL) return;

    const finalSubImages = subImgUrls.filter((img) => img.trim() !== "");

    const payload = {
      ...formData,
      subImages: finalSubImages,
      categoryId: formData.categoryId,
    };
    
    if (!payload.name || !payload.image || payload.price <= 0) {
        alert("❌ Vui lòng điền đủ Tên sản phẩm, Ảnh chính và Giá.");
        return;
    }


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
      console.error("Lỗi gửi/cập nhật sản phẩm:", err);
      
      // Sử dụng Type Guard của Axios (cần đảm bảo Axios version mới)
      if (axios.isAxiosError(err) && (err as AxiosError).response) { 
         const serverError = (err as AxiosError).response?.data as any;
         alert(`❌ Có lỗi xảy ra! Lỗi Server: ${serverError?.message || (err as AxiosError).response?.statusText}`);
      } else {
         alert("❌ Có lỗi xảy ra! Vui lòng kiểm tra console.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Xóa sản phẩm này sẽ không thể hoàn tác. Bạn chắc chắn chứ?"
      )
    )
      return;
    
    const token = localStorage.getItem("token");
    if (!token || !API_URL) return;

    try {
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Đã xóa sản phẩm thành công!");
      fetchProducts();
    } catch (e) {
      console.error(e);
      alert("Lỗi xóa sản phẩm! Vui lòng kiểm tra lại quyền.");
    }
  };


  // --- RENDER ---
  
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
                <label>Giá (VNĐ) (*)</label>
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
                placeholder="https://images.example.com/main.jpg"
              />
              <label className="icon-label">
                <IconImage /> {/* Đã sử dụng alias đã FIX kiểu */}
              </label>
            </div>

            <label>Ảnh phụ (Gallery)</label>
            <div className="sub-images-grid">
              {subImgUrls.map((url, index) => (
                <input
                  key={index}
                  placeholder={`Ảnh phụ ${index + 1}`}
                  value={url}
                  onChange={(e) => handleSubImgUrlChange(index, e.target.value)}
                />
              ))}
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
              placeholder="Kích thước (ví dụ: D10 x H15 cm)"
            />
            <input
              name="weight"
              value={formData.weight || ""}
              onChange={handleChange}
              placeholder="Trọng lượng (ví dụ: 1.2 kg)"
            />
            <input
              name="material"
              value={formData.material || ""}
              onChange={handleChange}
              placeholder="Chất liệu (ví dụ: Gốm sứ Bát Tràng)"
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
                      <IconEdit /> {/* Đã sử dụng alias đã FIX kiểu */}
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p.id)}
                    >
                      <IconTrash /> {/* Đã sử dụng alias đã FIX kiểu */}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4">
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