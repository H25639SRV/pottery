import React from "react";
import "../styles/Privacy.css";
// Không cần import ảnh nếu chúng được đặt trong thư mục 'public'

const Privacy: React.FC = () => {
  return (
    <div className="privacy-page">
      {/* Phần 1: Về chúng tôi - Layout (Ảnh bên trái, Text bên phải) - Giữ nguyên thứ tự HTML & CSS mặc định (flex-direction: row) */}
      <div className="section about-us-section">
        <div className="image-container left">
          <img
            src="/image/privacy1.png"
            alt="Mộc Gốm - Sản phẩm gốm sứ"
            className="section-image"
          />
        </div>
        <div className="text-content right">
          <h1>Về chúng tôi</h1>
          <p className="headline">
            <strong>Mộc Gốm</strong> – Hơi thở của đất, nhịp sống của bàn tay
            Việt.
          </p>
          <p>
            Chúng tôi khởi nguồn từ niềm tin rằng mỗi sản phẩm gốm không chỉ là
            vật dụng, mà là câu chuyện về con người, văn hóa và tình yêu với
            thiên nhiên.
          </p>
          <p>
            Giữa nhịp sống hiện đại vội vã, Mộc Gốm là khoảng lặng mộc mạc – nơi
            đất, nước và lửa hòa quyện để tạo nên những hình hài mang linh hồn
            Việt. Mỗi chiếc chậu, mỗi đường vân đều được tạo tác bằng bàn tay
            thủ công của người thợ làng gốm, gìn giữ kỹ nghệ truyền thống qua
            từng thế hệ.
          </p>
          <p>
            Nhưng Mộc Gốm không chỉ dừng lại ở quá khứ. Chúng tôi mang công nghệ
            đến gần hơn với nghệ thuật, khi mỗi khách hàng có thể cá nhân hóa
            sản phẩm của riêng mình – khắc họa hình ảnh, họa tiết, hay thông
            điệp theo phong cách riêng, và xem trước bản thiết kế{" "}
            <strong>2D trực tuyến</strong> trên website của chúng tôi.
          </p>
          <p>
            Tại Mộc Gốm, mỗi sản phẩm là một mảnh ghép văn hóa sống động – nơi
            vẻ đẹp truyền thống được tái sinh trong hơi thở hiện đại. Chúng tôi
            tin rằng: khi chạm tay vào đất, là khi ta chạm vào cội nguồn.
          </p>
        </div>
      </div>

      <hr />

      {/* Phần 2: Nguồn cảm hứng - Layout (Text bên trái, Ảnh bên phải) */}
      <div className="section inspiration-section">
        {/* Đảo thứ tự các phần tử con trong HTML so với phần 1 */}
        <div className="text-content left">
          <h2>Nguồn cảm hứng</h2>
          <p>
            Trong nhịp sống hiện đại đầy vội vã, con người dường như ngày càng
            xa rời thiên nhiên. Những chậu cây từng là góc nhỏ bình yên trong
            nhà, nay lại bị bỏ quên giữa bộn bề công việc, áp lực và màn hình
            sáng rực. Nhiều người muốn chăm sóc một chậu cây, muốn nhìn thấy mầm
            xanh lớn lên mỗi ngày — nhưng lại chẳng có đủ thời gian hay không
            gian để bắt đầu.
          </p>
          <p>
            <strong>Mộc Gốm</strong> ra đời từ chính những trăn trở ấy. Chúng
            tôi mong muốn mang lại một cách kết nối mới giữa con người và thiên
            nhiên, nơi mỗi chiếc chậu không chỉ là vật chứa, mà là một người bạn
            đồng hành – một hơi thở của sự sống nơi làm việc, trong căn nhà hiện
            đại.
          </p>
          <p>
            Từ cảm hứng về nhịp sống đô thị, Mộc Gốm kết hợp nghệ thuật thủ công
            truyền thống với công nghệ cá nhân hóa và hình ảnh xem trước 2D,
            giúp mọi người có thể tự tay tạo nên góc xanh của riêng mình – dù
            bận rộn đến đâu.
          </p>
          <p>
            Bởi chúng tôi tin rằng, giữa thế giới hối hả này, một chậu gốm nhỏ
            cũng có thể trở thành nơi tâm hồn được nghỉ ngơi và bình yên tìm về.
          </p>
        </div>
        <div className="image-container right">
          <img
            src="/image/privacy2.png"
            alt="Mộc Gốm - Kết nối công nghệ và thiên nhiên"
            className="section-image"
          />
        </div>
      </div>
    </div>
  );
};

export default Privacy;
