import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../styles/NavBar.css";

// --- INTERFACE MỚI ---
interface Category {
  id: number;
  name: string;
  slug: string;
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

  const [categories, setCategories] = useState<Category[]>([]);

  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null); // ✅ ĐÃ CÓ REF

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const username = user?.username || "Khách";

  const toggleUserDropdown = () => setShowUserDropdown((prev) => !prev);

  // --- LẤY CATEGORIES TỪ API ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<Category[]>(`${API_URL}/api/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error("Lỗi khi tải categories:", error);
        setCategories([
          { id: 1, name: "Dáng Việt", slug: "dang-viet" },
          { id: 2, name: "Âm vang di sản", slug: "am-vang-di-san" },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // --- EFFECT KHẮC PHỤC THIẾU SÓT: Xử lý click ra ngoài cho cả hai dropdown ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Logic cho User Dropdown
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setShowUserDropdown(false);
      }
      
      // ✅ BỔ SUNG LOGIC CHO PRODUCT DROPDOWN
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(e.target as Node)
      ) {
        // Chỉ đóng nếu không phải do hover, để tránh xung đột với onMouseLeave/onMouseEnter
        if (!showProductDropdown) return;
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProductDropdown]); // Dependency để cập nhật trạng thái đóng chính xác

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(
        `/product?query=${encodeURIComponent(query.trim())}&sort=relevance`
      );
      setQuery("");
    }
  };

  const handleCategoryClick = (categoryId: number | 'all') => {
    let path = '';
    if (categoryId === 'all') {
        path = '/product?sort=all';
    } else {
        path = `/product?category=${categoryId}&sort=category`;
    }
    navigate(path);
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

        {/* --- DROPDOWN SẢN PHẨM --- */}
        <div
          className="navbar-link product-dropdown-trigger"
          onMouseEnter={() => setShowProductDropdown(true)}
          onMouseLeave={() => setShowProductDropdown(false)}
          ref={productDropdownRef}
        >
          <Link to="/product" className="navbar-link-base">
            Sản phẩm
          </Link>
          {showProductDropdown && (
            <div className="dropdown-menu product-menu user-menu-options">
              
              <button
                className="dropdown-item" 
                onClick={() => handleCategoryClick('all')}
              >
                Tất cả sản phẩm
              </button>

              {categories.map((cat) => (
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