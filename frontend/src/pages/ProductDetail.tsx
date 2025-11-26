import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axios from "axios";
import "../styles/ProductDetail.css";

const API_URL = process.env.REACT_APP_API_URL || "";
const CLIENT_URL = process.env.REACT_APP_CLIENT_URL || "";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  sub_images?: string | string[];
  description?: string;
  story?: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>("");

  // Danh sách ảnh gallery
  const [galleryList, setGalleryList] = useState<string[]>([]);
  // Danh sách các ảnh bị lỗi (404) để ẩn đi
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

  const productId = id ? parseInt(id) : undefined;

  useEffect(() => {
    if (productId) {
      fetchProductDetail(productId);
    }
  }, [productId]);

  // --- HÀM 1: TỰ ĐỘNG SINH TÊN ẢNH (FALLBACK) ---
  // Nếu ảnh chính là "/abc/xyz.png" -> sinh ra "/abc/xyz2.png", "/abc/xyz3.png"...
  const generateFallbackImages = (mainImage: string): string[] => {
    try {
      // Tách phần mở rộng (.png, .jpg)
      const lastDotIndex = mainImage.lastIndexOf(".");
      if (lastDotIndex === -1) return [];

      const basePath = mainImage.substring(0, lastDotIndex); // "/image/aodai/aodai"
      const extension = mainImage.substring(lastDotIndex); // ".png"

      const fallbacks: string[] = [];

      // Vòng lặp chạy từ 2 đến 5 (tổng cộng 4 ảnh phụ: 2, 3, 4, 5)
      for (let i = 2; i <= 5; i++) {
        fallbacks.push(`${basePath}${i}${extension}`);
      }
      return fallbacks;
    } catch (e) {
      return [];
    }
  };

  // --- HÀM 2: XỬ LÝ DATABASE + GỘP FALLBACK ---
  const processImages = (data: Product) => {
    let images: string[] = [data.image];

    // B1: Thử lấy từ Database trước
    const rawSub = data.sub_images;
    let dbImages: string[] = [];

    if (Array.isArray(rawSub)) {
      dbImages = rawSub;
    } else if (typeof rawSub === "string" && rawSub.trim() !== "") {
      try {
        const validJson = rawSub.replace(/'/g, '"');
        const parsed = JSON.parse(validJson);
        if (Array.isArray(parsed)) dbImages = parsed;
      } catch {
        dbImages = [rawSub];
      }
    }

    // B2: Nếu Database có dữ liệu thì dùng, nếu KHÔNG có thì dùng thuật toán đoán tên
    if (dbImages.length > 0) {
      images = [...images, ...dbImages];
    } else {
      // Kích hoạt chế độ đoán tên file
      const guessedImages = generateFallbackImages(data.image);
      console.log("⚠️ Database trống, đang thử đoán ảnh:", guessedImages);
      images = [...images, ...guessedImages];
    }

    // Lọc trùng
    const uniqueList = Array.from(new Set(images));
    setGalleryList(uniqueList);
  };

  const fetchProductDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await axios.get<Product>(`${API_URL}/api/products/${id}`);
      const data = res.data;
      setProduct(data);
      setActiveImage(API_URL + "/" + data.image);

      // Xử lý ảnh
      processImages(data);
    } catch (err) {
      console.error("❌ Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM 3: XỬ LÝ KHI ẢNH BỊ LỖI (404) ---
  // Nếu đoán sai tên (file không tồn tại), hàm này sẽ ẩn ảnh đó đi
  const handleImageError = (imgUrl: string) => {
    // console.log("Ẩn ảnh lỗi:", imgUrl);
    setErrorImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(imgUrl);
      return newSet;
    });

    // Nếu ảnh đang xem (activeImage) bị lỗi, quay về ảnh gốc
    if (activeImage === imgUrl && product) {
      setActiveImage(CLIENT_URL + "/" + product.image);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (!user?.id) {
      alert("Vui lòng đăng nhập để mua hàng.");
      navigate("/login");
      return;
    }
    if (!product || !productId) return;
    try {
      await addToCart(user.id, productId, quantity);
      if (window.confirm("Đã thêm vào giỏ! Đến giỏ hàng ngay?"))
        navigate("/cart");
    } catch {
      alert("Lỗi thêm vào giỏ hàng.");
    }
  };

  if (loading)
    return (
      <div
        className="detail-container"
        style={{ padding: "40px", textAlign: "center" }}
      >
        Đang tải...
      </div>
    );
  if (!product)
    return (
      <div
        className="detail-container"
        style={{ padding: "40px", textAlign: "center" }}
      >
        Không tìm thấy sản phẩm.
      </div>
    );

  // Lọc bỏ những ảnh đã bị đánh dấu là lỗi (404) khỏi danh sách hiển thị
  const visibleGallery = galleryList.filter((img) => !errorImages.has(img));

  return (
    <div className="detail-container">
      <div className="product-info-section">
        {/* === CỘT ẢNH === */}
        <div className="product-gallery">
          <div className="main-image-wrapper">
            <img
              src={activeImage}
              alt={product.name}
              className="main-image"
              onError={() => handleImageError(activeImage)}
            />
          </div>
          {/* List ảnh nhỏ */}
          {visibleGallery.length && (
            <div className="sub-images-list">
              {galleryList.map((img, index) => (
                <img
                  key={index}
                  src={CLIENT_URL + "/" + img}
                  alt={`Góc ${index}`}
                  className={`sub-image ${activeImage === img ? "active" : ""}`}
                  onClick={() => setActiveImage(img)}
                  // Quan trọng: Nếu ảnh này không tồn tại trên server, nó sẽ tự ẩn đi
                  onError={() => handleImageError(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* === CỘT THÔNG TIN === */}
        <div className="product-details">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">{product.price.toLocaleString()} VND</p>

          <div className="quantity-control">
            <label>Số lượng:</label>
            <div className="quantity-box">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input type="text" value={quantity} readOnly />
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>

          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </button>

          <div className="product-story">
            <h2>Câu chuyện sản phẩm</h2>
            <p>{product.story || "Đang cập nhật..."}</p>
          </div>
          <div className="product-story" style={{ marginTop: "20px" }}>
            <h2>Mô tả chi tiết</h2>
            <p>{product.description || "Chưa có mô tả."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
