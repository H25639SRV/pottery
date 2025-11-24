import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaShoppingCart } from "react-icons/fa";
import axios from "axios"; // 👈 Thêm axios để gọi API
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../styles/NavBar.css";

// --- INTERFACE MỚI ---
interface Category {
  id: number;
  name: string;
  slug: string; // Tùy chọn, nếu bạn dùng slug thay vì ID
}
// --------------------

const API_URL = process.env.REACT_APP_API_URL || "";
const SearchIcon = FaSearch as React.ElementType;
const UserIcon = FaUser as React.ElementType;
const CartIcon = FaShoppingCart as React.ElementType;

const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // 👈 STATE MỚI: Lưu trữ danh sách categories
  const [categories, setCategories] = useState<Category[]>([]);

  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const username = user?.username || "Khách";

  const toggleUserDropdown = () => setShowUserDropdown((prev) => !prev);

  // --- LẤY CATEGORIES TỪ API ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // 🚨 Điều chỉnh endpoint API này cho phù hợp với Backend của bạn
        const res = await axios.get<Category[]>(`${API_URL}/api/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error("Lỗi khi tải categories:", error);
        // Fallback: Giữ nguyên categories tĩnh nếu API lỗi
        setCategories([
          { id: 1, name: "Dáng Việt", slug: "dang-viet" },
          { id: 2, name: "Âm vang di sản", slug: "am-vang-di-san" },
        ]);
      }
    };
    fetchCategories();
  }, []); // Chỉ chạy 1 lần khi component mount

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // 👈 THÊM: Sử dụng tham số `sort` để báo hiệu cần sort theo tìm kiếm
      navigate(
        `/product?query=${encodeURIComponent(query.trim())}&sort=relevance`
      );
      setQuery("");
    }
  };

  // 👈 HÀM XỬ LÝ KHI CLICK VÀO CATEGORY
  const handleCategoryClick = (categoryId: number) => {
    // Điều hướng đến trang sản phẩm và truyền categoryId + yêu cầu sort theo category
    navigate(`/product?category=${categoryId}&sort=category`);
    setShowProductDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <img
            src="/image/mocgom.png"
            alt="Mộc Gốm Logo"
            className="logo-image"
          />
        </Link>
      </div>

      <div className="navbar-center">
        <Link to="/" className="navbar-link">
          Trang chủ
        </Link>

        {/* --- DROPDOWN SẢN PHẨM (DYNAMIC) --- */}
        <div
          className="navbar-link product-dropdown-trigger"
          onMouseEnter={() => setShowProductDropdown(true)}
          onMouseLeave={() => setShowProductDropdown(false)}
          ref={productDropdownRef}
        >
          {/* Link cơ sở, khi click sẽ đưa về trang tất cả sản phẩm */}
          <Link to="/product" className="navbar-link-base">
            Sản phẩm
          </Link>
          {showProductDropdown && (
            <div className="dropdown-menu product-menu">
              {/* 1. Link Tất cả sản phẩm */}
              <Link
                to="/product?sort=all"
                className="dropdown-item"
                onClick={() => setShowProductDropdown(false)}
              >
                Tất cả sản phẩm
              </Link>

              {/* 2. Render danh sách Category từ state */}
              {categories.map((cat) => (
                // Thay vì dùng <Link>, dùng <button> và navigate để kiểm soát sort
                <button
                  key={cat.id}
                  className="dropdown-item"
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* --- HẾT DROPDOWN SẢN PHẨM --- */}

        <Link to="/privacy" className="navbar-link">
          Giới thiệu
        </Link>
        <Link to="/render" className="navbar-link">
          Thử hoa văn
        </Link>
      </div>

      <div className="navbar-right">
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">
            <SearchIcon className="icon" />
          </button>
        </form>

        <div className="cart-container">
          <Link to="/cart" className="icon-btn">
            <CartIcon className="icon" />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>

        {user ? (
          <div className="user-menu" ref={userDropdownRef}>
            <div className="user-info" onClick={toggleUserDropdown}>
              <UserIcon className="icon" />
              <span className="greeting">
                Xin chào <b>{isAdmin ? "Quản trị viên" : "Người dùng"}</b>{" "}
                <span>{username}</span>
              </span>
            </div>

            {showUserDropdown && (
              <div
                className="dropdown-menu user-menu-options"
                onMouseEnter={() => setShowUserDropdown(true)}
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                {isAdmin && (
                  <>
                    {/* Nên dùng Link thay vì button bao Link, nhưng giữ cấu trúc cũ */}
                    <button className="dropdown-item">
                      <Link to="/admin/edit">Chỉnh sửa sản phẩm</Link>
                    </button>
                    <button className="dropdown-item">
                      <Link to="/admin/orders">Quản lý đơn hàng</Link>
                    </button>
                    <button className="dropdown-item">
                      <Link to="/admin/custom-orders">Yêu cầu Custom</Link>
                    </button>
                  </>
                )}

                <div className="dropdown-item">
                  <button className="dropdown-button" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="icon-btn">
            <UserIcon className="icon" />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
