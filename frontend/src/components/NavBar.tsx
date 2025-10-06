import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import "../styles/NavBar.css";

const SearchIcon = FaSearch as React.ElementType;
const UserIcon = FaUser as React.ElementType;
const CartIcon = FaShoppingCart as React.ElementType;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate("/")}>
        <h1 className="logo">Mộc Gốm</h1>
      </div>

      <div className="navbar-center">
        <Link to="/">Trang chủ</Link>
        <Link to="/product">Sản phẩm</Link>
        <Link to="/about">Giới thiệu</Link>
        <Link to="/contact">Liên hệ</Link>
      </div>

      <div className="navbar-right">
        <div className="search-box">
          <SearchIcon className="search-icon" />
          <input type="text" placeholder="Tìm kiếm..." />
        </div>

        <CartIcon className="icon cart-icon" title="Giỏ hàng" />

        {/* 👇 Dropdown container bao trùm cả icon và menu */}
        <div
          className="user-dropdown-wrapper"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <UserIcon className="icon user-icon" title="Tài khoản" />

          {showDropdown && (
            <div className="dropdown-menu">
              <Link to="/login">Đăng nhập</Link>
              <Link to="/signup">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
