import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <h2 className="footer-title">Mộc Gốm</h2>
        <h3>Tinh hoa Gốm Việt</h3>
        <div className="footer-contact">
          <p>
            📍 Địa chỉ: 1304 P. Kim Mã, Ngọc Khánh, Ba Đình, Hà Nội, Việt Nam
          </p>
          <p>📞 Điện thoại: 1900 1 tông 1 dép 1 tông vào mép 1 dép vào mồm</p>
          <p>📧 Email: phuonggavkl@gmail.com</p>
        </div>
      </div>

      <div className="footer-links">
        <h4>Khám phá</h4>
        <Link to="/">Trang chủ</Link>
        <Link to="/shop">Cửa hàng</Link>
        <Link to="/home/privacy">Liên hệ</Link>
        <Link to="/support">Hỗ trợ</Link>
      </div>

      <div className="footer-links">
        <h4>Chính sách</h4>
        <Link to="/policy/return">Chính sách đổi trả</Link>
        <Link to="/policy/shipping">Chính sách vận chuyển</Link>
        <Link to="/home/privacy">Bảo mật & quyền riêng tư</Link>
      </div>

      <div className="footer-links">
        <h4>Hướng dẫn</h4>
        <Link to="/guide/size">Hướng dẫn chọn size</Link>
        <Link to="/faq">Câu hỏi thường gặp</Link>
        <Link to="/consulting">Tư vấn nền tảng</Link>
      </div>

      <div className="footer-bottom">
        <p>Made by H25639SRV</p>
      </div>
    </footer>
  );
};

export default Footer;
