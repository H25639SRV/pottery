import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/Search.css";

const products = [
  { id: 1, name: "Bình hoa gốm", price: 200000, image: "/image/pottery1.png" },
  { id: 2, name: "Chậu cây nhỏ", price: 150000, image: "/image/pottery2.png" },
  {
    id: 3,
    name: "Ly gốm thủ công",
    price: 100000,
    image: "/image/pottery3.png",
  },
  { id: 4, name: "Bình trà gốm", price: 250000, image: "/image/pottery4.png" },
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Search: React.FC = () => {
  const query = useQuery();
  const searchTerm = query.get("query")?.toLowerCase() || "";

  const results = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="search-container">
      <h2>Kết quả tìm kiếm cho: "{searchTerm}"</h2>
      <div className="search-grid">
        {results.length > 0 ? (
          results.map((p) => (
            <div key={p.id} className="search-card">
              <img src={p.image} alt={p.name} />
              <h3>{p.name}</h3>
              <p>{p.price.toLocaleString()} VND</p>
            </div>
          ))
        ) : (
          <p>Không tìm thấy sản phẩm phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default Search;
