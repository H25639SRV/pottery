import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaImage, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/AdminProduct.css";

// ✅ Ép kiểu thủ công cho icon
const IconImage = FaImage as unknown as React.FC;
const IconEdit = FaEdit as unknown as React.FC;
const IconTrash = FaTrash as unknown as React.FC;

// ✅ Kiểu dữ liệu chuẩn Prisma
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
}

const AdminProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
    description: "",
    image: "",
  });
  const [editing, setEditing] = useState<Product | null>(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ✅ Kiểm tra quyền admin
  useEffect(() => {
    if (role?.toUpperCase() !== "ADMIN") {
      alert("Bạn không có quyền truy cập trang này!");
      navigate("/");
    } else {
      fetchProducts();
    }
  }, []);

  // ✅ Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const res = await axios.get<Product[]>("/api/products");
      console.log("📦 Dữ liệu sản phẩm:", res.data);
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải sản phẩm:", err);
    }
  };

  // ✅ Thêm hoặc cập nhật sản phẩm
  const handleAddOrUpdate = async () => {
    try {
      if (editing) {
        // 🛠️ Đang chỉnh sửa → PUT
        const updatedProduct = {
          name: editing.name,
          price: editing.price,
          stock: editing.stock,
          description: editing.description,
          image: editing.image,
        };

        await axios.put(`/api/products/${editing.id}`, updatedProduct, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert("✅ Cập nhật sản phẩm thành công!");
      } else {
        // 🆕 Thêm mới → POST
        const newProductData = {
          name: newProduct.name,
          price: newProduct.price,
          stock: newProduct.stock,
          description: newProduct.description,
          image: newProduct.image,
        };

        await axios.post("/api/products", newProductData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert("✅ Thêm sản phẩm thành công!");
      }

      // 🔁 Làm mới form và danh sách
      setEditing(null);
      setNewProduct({
        id: 0,
        name: "",
        price: 0,
        stock: 0,
        description: "",
        image: "",
      });
      await fetchProducts();
    } catch (err) {
      console.error("❌ Lỗi khi thêm/cập nhật sản phẩm:", err);
    }
  };

  // ✅ Xóa sản phẩm
  const handleDelete = async (id?: number) => {
    console.log("🆔 ID nhận được:", id);
    if (!id) return alert("❌ ID sản phẩm không hợp lệ!");
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ Đã xóa sản phẩm!");
      fetchProducts();
    } catch (err) {
      console.error("❌ Lỗi khi xóa sản phẩm:", err);
    }
  };

  // ✅ Chọn ảnh từ máy tính
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (editing) {
        setEditing({ ...editing, image: imageUrl });
      } else {
        setNewProduct({ ...newProduct, image: imageUrl });
      }
    }
  };

  return (
    <div className="admin-page">
      <h2>🛒 Quản lý sản phẩm</h2>

      <div className="product-form">
        <input
          type="text"
          placeholder="Tên sản phẩm"
          value={editing ? editing.name : newProduct.name}
          onChange={(e) =>
            editing
              ? setEditing({ ...editing, name: e.target.value })
              : setNewProduct({ ...newProduct, name: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Giá sản phẩm (VNĐ)"
          value={editing ? editing.price : newProduct.price}
          onChange={(e) =>
            editing
              ? setEditing({ ...editing, price: Number(e.target.value) })
              : setNewProduct({ ...newProduct, price: Number(e.target.value) })
          }
        />

        <input
          type="number"
          placeholder="Số lượng trong kho"
          value={editing ? editing.stock : newProduct.stock}
          onChange={(e) =>
            editing
              ? setEditing({ ...editing, stock: Number(e.target.value) })
              : setNewProduct({ ...newProduct, stock: Number(e.target.value) })
          }
        />

        <div className="image-upload">
          <label htmlFor="imageInput" className="image-btn">
            <IconImage /> Chọn ảnh
          </label>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          <input
            className="image-input"
            type="text"
            placeholder="URL ảnh hoặc chọn từ máy"
            value={editing ? editing.image : newProduct.image}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, image: e.target.value })
                : setNewProduct({ ...newProduct, image: e.target.value })
            }
          />
        </div>

        {(editing?.image || newProduct.image) && (
          <div className="image-preview">
            <img
              src={editing ? editing.image : newProduct.image}
              alt="Preview"
              className="preview-img"
            />
          </div>
        )}

        <textarea
          placeholder="Mô tả chi tiết sản phẩm..."
          value={editing ? editing.description : newProduct.description}
          onChange={(e) =>
            editing
              ? setEditing({ ...editing, description: e.target.value })
              : setNewProduct({ ...newProduct, description: e.target.value })
          }
        />

        <div className="form-buttons">
          <button className="add-btn" onClick={handleAddOrUpdate}>
            {editing ? "💾 Cập nhật" : "➕ Thêm sản phẩm"}
          </button>
          {editing && (
            <button className="cancel-btn" onClick={() => setEditing(null)}>
              ❌ Hủy
            </button>
          )}
        </div>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>Tên</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Mô tả</th>
            <th>Ảnh</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.stock}</td>
              <td>{p.description}</td>
              <td>
                <img src={p.image} alt={p.name} width="80" />
              </td>
              <td className="action-buttons">
                <button className="edit-btn" onClick={() => setEditing(p)}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductPage;
