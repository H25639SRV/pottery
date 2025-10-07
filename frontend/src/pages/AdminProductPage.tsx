import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminProduct.css";

interface Product {
  _id?: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

const AdminProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    price: 0,
    description: "",
    image: "",
  });
  const [editing, setEditing] = useState<Product | null>(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ✅ Chặn người không phải admin
  useEffect(() => {
    if (role !== "admin") {
      alert("Bạn không có quyền truy cập trang này!");
      navigate("/");
    } else {
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
    }
  };

  const handleAddOrUpdate = async () => {
    const url = editing
      ? `http://localhost:5000/api/products/${editing._id}`
      : "http://localhost:5000/api/products";
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editing ? editing : newProduct),
      });

      if (!res.ok) throw new Error("Thao tác thất bại!");
      alert(editing ? "Cập nhật thành công!" : "Thêm sản phẩm thành công!");
      setNewProduct({ name: "", price: 0, description: "", image: "" });
      setEditing(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Xóa thất bại!");
      alert("Đã xóa sản phẩm!");
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-page" style={{ padding: "30px" }}>
      <h2>Quản lý sản phẩm</h2>

      <div className="product-form" style={{ marginBottom: "20px" }}>
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
          placeholder="Giá"
          value={editing ? editing.price : newProduct.price}
          onChange={(e) =>
            editing
              ? setEditing({ ...editing, price: Number(e.target.value) })
              : setNewProduct({ ...newProduct, price: Number(e.target.value) })
          }
        />
        <input
          type="text"
          placeholder="Ảnh URL"
          value={editing ? editing.image : newProduct.image}
          onChange={(e) =>
            editing
              ? setEditing({ ...editing, image: e.target.value })
              : setNewProduct({ ...newProduct, image: e.target.value })
          }
        />
        <textarea
          placeholder="Mô tả"
          value={editing ? editing.description : newProduct.description}
          onChange={(e) =>
            editing
              ? setEditing({ ...editing, description: e.target.value })
              : setNewProduct({ ...newProduct, description: e.target.value })
          }
        />
        <button onClick={handleAddOrUpdate}>
          {editing ? "Cập nhật" : "Thêm sản phẩm"}
        </button>
        {editing && <button onClick={() => setEditing(null)}>Hủy</button>}
      </div>

      <table border={1} cellPadding={8} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Giá</th>
            <th>Mô tả</th>
            <th>Ảnh</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.description}</td>
              <td>
                <img src={p.image} alt={p.name} width="80" />
              </td>
              <td>
                <button onClick={() => setEditing(p)}>Sửa</button>
                <button onClick={() => handleDelete(p._id!)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductPage;
