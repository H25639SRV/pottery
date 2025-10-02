import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-green-700">Pottery Shop</h1>

        {/* Menu */}
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li>
            <a href="#">Bộ sưu tập</a>
          </li>
          <li>
            <a href="#">Sản phẩm</a>
          </li>
          <li>
            <a href="#">Liên hệ</a>
          </li>
        </ul>

        {/* Search + User */}
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            className="border rounded px-2 py-1"
          />
          <button className="text-gray-600">👤</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
