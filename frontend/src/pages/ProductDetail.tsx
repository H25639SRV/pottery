import React, { useState, useEffect, useCallback } from "react";
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

// --- HÀM HỖ TRỢ: CHUẨN HÓA ĐƯỜNG DẪN ẢNH ---
// Đảm bảo loại bỏ dấu gạch chéo ở đầu đường dẫn tương đối (ví dụ: "/image/x.png" -> "image/x.png")
const normalizeImagePath = (path: string): string => {
  return path.startsWith("/") ? path.substring(1) : path;
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>("");

  const [galleryList, setGalleryList] = useState<string[]>([]);
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

  const productId = id ? parseInt(id) : undefined;

  // --- HÀM 1: TỰ ĐỘNG SINH TÊN ẢNH (FALLBACK) ---
  const generateFallbackImages = (mainImage: string): string[] => {
    try {
      // Chuẩn hóa ảnh chính trước khi sinh tên
      const normalizedImage = normalizeImagePath(mainImage);
      const lastDotIndex = normalizedImage.lastIndexOf(".");
      if (lastDotIndex === -1) return [];

      const basePath = normalizedImage.substring(0, lastDotIndex);
      const extension = normalizedImage.substring(lastDotIndex);

      const fallbacks: string[] = [];
      for (let i = 2; i <= 5; i++) {
        // Các ảnh sinh ra cũng được chuẩn hóa (không có / ở đầu)
        fallbacks.push(`${basePath}${i}${extension}`);
      }
      return fallbacks;
    } catch (e) {
      return [];
    }
  };

  // --- HÀM 2: XỬ LÝ DATABASE + GỘP FALLBACK ---
  const processImages = useCallback((data: Product) => {
    // ⚠️ Ảnh chính đã được chuẩn hóa trong fetchProductDetail, nhưng ta cần dùng
    // bản gốc (từ data.image) để sinh ảnh phụ, sau đó chuẩn hóa
    const mainImageNormalized = normalizeImagePath(data.image);
    let images: string[] = [mainImageNormalized];

    // B1: Thử lấy từ Database trước và CHUẨN HÓA
    const rawSub = data.sub_images;
    let dbImages: string[] = [];

    if (Array.isArray(rawSub)) {
      dbImages = rawSub.map(normalizeImagePath);
    } else if (typeof rawSub === "string" && rawSub.trim() !== "") {
      try {
        const validJson = rawSub.replace(/'/g, '"');
        const parsed = JSON.parse(validJson);
        if (Array.isArray(parsed)) {
          // Chuẩn hóa các đường dẫn từ JSON
          dbImages = parsed.map(normalizeImagePath);
        }
      } catch {
        // Chuẩn hóa đường dẫn đơn lẻ
        dbImages = [normalizeImagePath(rawSub)];
      }
    }

    // B2: Nếu Database có dữ liệu thì dùng, nếu KHÔNG có thì dùng thuật toán đoán tên
    if (dbImages.length > 0) {
      images = [...images, ...dbImages];
    } else {
      const guessedImages = generateFallbackImages(data.image);
      console.log("⚠️ Database trống, đang thử đoán ảnh:", guessedImages);
      // guessedImages đã được chuẩn hóa trong generateFallbackImages
      images = [...images, ...guessedImages];
    }

    const uniqueList = Array.from(new Set(images));
    setGalleryList(uniqueList);
  }, []);

  const fetchProductDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await axios.get<Product>(`${API_URL}/api/products/${id}`);
      const data = res.data;
      setProduct(data);

      // --- SỬA LỖI NỐI CHUỖI 1 ---
      // 1. Chuẩn hóa data.image (loại bỏ dấu "/" ở đầu)
      const normalizedImage = normalizeImagePath(data.image);
      // 2. Nối chuỗi an toàn: [URL_GỐC] + "/" + [ĐƯỜNG DẪN ĐÃ CHUẨN HÓA]
      setActiveImage(API_URL + "/" + normalizedImage);

      // Xử lý ảnh
      processImages(data);
    } catch (err) {
      console.error("❌ Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetail(productId);
    }
  }, [productId, processImages]);

  // --- HÀM 3: XỬ LÝ KHI ẢNH BỊ LỖI (404) ---
  const handleImageError = (imgUrl: string) => {
    // Thêm URL ảnh lỗi vào Set
    setErrorImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(imgUrl);
      return newSet;
    });

    // Nếu ảnh đang xem bị lỗi, quay về ảnh gốc (Đã được chuẩn hóa)
    if (activeImage === imgUrl && product) {
      const normalizedImage = normalizeImagePath(product.image);
      setActiveImage(API_URL + "/" + normalizedImage);
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
  // Lưu ý: galleryList chứa các đường dẫn đã được chuẩn hóa (ví dụ: "image/x.png")
  const visibleGallery = galleryList.filter((img) => {
    // Dùng URL đầy đủ để check lỗi trong Set
    const fullUrl = CLIENT_URL + "/" + img;
    return !errorImages.has(fullUrl);
  });

  return (
    <div className="detail-container">
      <div className="product-info-section">
        {/* === CỘT ẢNH === */}
        <div className="product-gallery">
          <div className="main-image-wrapper">
            <img
              // activeImage đã là URL đầy đủ và đúng (API_URL + normalized path)
              src={activeImage}
              alt={product.name}
              className="main-image"
              // Dùng URL đầy đủ để đánh dấu ảnh lỗi
              onError={() => handleImageError(activeImage)}
            />
          </div>
          {/* List ảnh nhỏ */}
          {visibleGallery.length > 0 && ( // Kiểm tra visibleGallery.length
            <div className="sub-images-list">
              {galleryList.map((img, index) => {
                // img đã được CHUẨN HÓA (ví dụ: "image/x.png")
                const fullUrl = CLIENT_URL + "/" + img; // Nối chuỗi an toàn

                // Nếu ảnh này đã bị đánh dấu lỗi, ta ẩn nó đi
                if (errorImages.has(fullUrl)) {
                    return null;
                }

                return (
                  <img
                    key={index}
                    // --- SỬA LỖI NỐI CHUỖI 2 ---
                    // Nối chuỗi an toàn: CLIENT_URL + "/" + [ĐƯỜNG DẪN ĐÃ CHUẨN HÓA]
                    src={fullUrl}
                    alt={`Góc ${index}`}
                    // So sánh với URL đầy đủ
                    className={`sub-image ${activeImage === fullUrl ? "active" : ""}`}
                    // Khi click, chuyển sang URL đầy đủ
                    onClick={() => setActiveImage(fullUrl)}
                    // Quan trọng: Sử dụng fullUrl để đánh dấu ảnh lỗi
                    onError={() => handleImageError(fullUrl)}
                  />
                );
              })}
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