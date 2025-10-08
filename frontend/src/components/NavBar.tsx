import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/NavBar.css";

// Giữ nguyên cấu trúc icon
const SearchIcon = FaSearch as React.ElementType;
const UserIcon = FaUser as React.ElementType;
const CartIcon = FaShoppingCart as React.ElementType;

const Navbar: React.FC = () => {
  const { token, role, email, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lấy username từ localStorage (được lưu khi login)
  const username = localStorage.getItem("username");

  // Toggle dropdown khi click vào icon user
  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  // Ẩn dropdown khi click ra ngoài
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${search}`);
  };

  return (
    <nav className="navbar">
      {/* 1/3 trái: logo */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          Mộc Gốm
        </Link>
      </div>

      {/* 2/3 giữa: menu */}
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

      {/* Bên phải: search + cart + user */}
      <div className="navbar-right">
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">
            <SearchIcon className="icon" />
          </button>
        </form>

        <Link to="/cart" className="icon-btn">
          <CartIcon className="icon" />
        </Link>

        {token ? (
          <div className="user-menu" ref={dropdownRef}>
            {/* Hiển thị icon + lời chào */}
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
                  <Link to="/admin/edit" className="dropdown-item">
                    Chỉnh sửa sản phẩm
                  </Link>
                )}

                <button
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
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
