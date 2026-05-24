export const revalidate = 0;

import { getProductByType } from "../api/productState";
import ProductList from "../component/ProductList";

export default async function Products() {
  const data = await getProductByType();
  
  // Biến đổi toàn bộ các object phức tạp (như Timestamp) thành dữ liệu thuần túy (Plain Objects)
  const singleProducts = JSON.parse(JSON.stringify(data.singleProducts || []));
  const mixProducts = JSON.parse(JSON.stringify(data.mixProducts || []));
  const smoothieProducts = JSON.parse(JSON.stringify(data.smoothieProducts || []));
  const otherProducts = JSON.parse(JSON.stringify(data.otherProducts || []));
  
  return (
    <div className="min-h-screen bg-[#f5e6d3] py-8 relative overflow-hidden">
      {/* Ảnh nền trang trí */}
      <img
        src="/images/menu/bg1.png"
        alt="orange slice"
        className="top-0 left-0 absolute h-full w-full object-cover opacity-70 pointer-events-none"
      />

      {/* HEADER */}
      <div className="text-center mb-8 relative z-10 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-green-600 drop-shadow-sm">
          THỰC ĐƠN ĐỒ UỐNG 🍹
        </h1>
        <h2 className="text-orange-600 text-lg md:text-2xl mt-3 italic font-medium">
          <strong className="not-italic text-green-700">Nước ép Nhà Su:</strong> Tươi ngon và tốt cho sức khỏe mỗi ngày
        </h2>
      </div>

      {/* TRUYỀN DỮ LIỆU ĐÃ ĐƯỢC LÀM SẠCH XUỐNG CLIENT */}
      <ProductList 
        singleProducts={singleProducts} 
        mixProducts={mixProducts}
        smoothieProducts={smoothieProducts} 
        otherProducts={otherProducts} 
      />
    </div>
  );
}