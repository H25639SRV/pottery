import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../styles/NavBar.css";

// ✅ Giữ nguyên icon
const SearchIcon = FaSearch as React.ElementType;
const UserIcon = FaUser as React.ElementType;
const CartIcon = FaShoppingCart as React.ElementType;

const Navbar: React.FC = () => {
  const { token, role, logout } = useAuth();
  const { cart } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const username = localStorage.getItem("username");

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ✅ Khi tìm kiếm → điều hướng sang trang product + query
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/product?query=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          Mộc Gốm
        </Link>
      </div>

      <div className="navbar-center">
        <Link to="/" className="navbar-link">
          Trang chủ
        </Link>
        <Link to="/product" className="navbar-link">
          Sản phẩm
        </Link>
        <Link to="/about" className="navbar-link">
          Giới thiệu
        </Link>
        <Link to="/privacy" className="navbar-link">
          Liên hệ
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

        {token ? (
          <div className="user-menu" ref={dropdownRef}>
            <div className="user-info" onClick={toggleDropdown}>
              <UserIcon className="icon" />
              <span className="greeting">
                Xin chào{" "}
                <b>{role === "ADMIN" ? "Quản trị viên" : "Người dùng"}</b>{" "}
                {username && <span>{username}</span>}
              </span>
            </div>

            {showDropdown && (
              <div
                className="dropdown-menu"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                {role === "ADMIN" && (
                  <button className="dropdown-item">
                    <Link to="/admin/edit">Chỉnh sửa sản phẩm</Link>
                  </button>
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
