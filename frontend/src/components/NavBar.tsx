import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import "../styles/NavBar.css";

const NavBar: React.FC = () => {
  const { user, logout, cart } = useAppContext();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">Trang chủ</Link>
        <Link to="/cart">Giỏ hàng ({cart.length})</Link>
        <Link to="/orders">Đơn hàng</Link>
        <Link to="/home/privacy">Liên hệ</Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span>Xin chào, {user.username}</span>
            <button onClick={logout}>Đăng xuất</button>
          </>
        ) : (
          <Link to="/login">Đăng nhập</Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
