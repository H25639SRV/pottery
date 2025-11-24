import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";
// Thêm icon từ react-icons/fa (Font Awesome)
import { FaFacebookF, FaTiktok } from "react-icons/fa";

// Áp dụng kỹ thuật ép kiểu (Type Assertion) để giải quyết lỗi TS2786
const FacebookIcon = FaFacebookF as React.ElementType;
const TiktokIcon = FaTiktok as React.ElementType;

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <h2 className="footer-title">Mộc Gốm</h2>
        <h3>Tinh hoa Gốm Việt</h3>
        <div className="footer-contact">
          <p>
            📍 Địa chỉ: Số 25, đường Lê Văn Lương, quận Thanh Xuân, Hà Nội, Việt
            Nam
          </p>
          {/* Cập nhật số điện thoại và email */}
          <p>📞 Điện thoại: 0972217734</p>
          <p>📧 Email: mocgom2025@gmail.com</p>
        </div>
      </div>

      <div className="footer-links">
        <h4>Khám phá</h4>
        <Link to="/">Trang chủ</Link>
        <Link to="/shop">Cửa hàng</Link>
        <Link to="/home/contact">Liên hệ</Link>
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

      {/* Cột mới cho Mạng xã hội */}
      <div className="footer-links footer-social">
        <h4>Kết nối</h4>
        <div className="social-icons">
          <a
            href="https://www.facebook.com/share/1a5EZMeLjb/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook"
            className="social-icon facebook"
          >
            {/* SỬ DỤNG COMPONENT ĐÃ ÉP KIỂU */}
            <FacebookIcon />
          </a>
          <a
            href="https://www.tiktok.com/@mocgoms_chaucaytutuoi?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok"
            className="social-icon tiktok"
          >
            {/* SỬ DỤNG COMPONENT ĐÃ ÉP KIỂU */}
            <TiktokIcon />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Made by H25639SRV | © 2025 Mộc Gốm. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
