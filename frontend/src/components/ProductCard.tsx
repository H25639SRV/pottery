import React from "react";
import sampleProduct from "../../template/image/sampleproduct.png";

interface ProductProps {
  name: string;
  price: number;
  image?: string;
}

const ProductCard: React.FC<ProductProps> = ({ name, price, image }) => {
  return (
    <div className="border rounded-lg shadow-md p-4 hover:scale-105 transition">
      <img
        src={image || sampleProduct}
        alt={name}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="mt-2 font-semibold text-lg">{name}</h3>
      <p className="text-gray-600">{price.toLocaleString()} đ</p>
      <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
        Thêm vào giỏ
      </button>
    </div>
  );
};

export default ProductCard;
