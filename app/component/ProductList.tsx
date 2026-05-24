"use client";
import { useCart } from "../api/useCart";
import { Toaster, toast } from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  name_en: string;
  price: number | string;
  image: string;
  title: string;
  size: string;
}

interface ProductListProps {
  singleProducts: Product[];
  mixProducts: Product[];
  smoothieProducts: Product[];
  otherProducts: Product[];
}

export default function ProductList({ singleProducts, mixProducts, smoothieProducts, otherProducts }: ProductListProps) {
  const addToCart = useCart((state) => state.addToCart);

  // Hàm bổ trợ xử lý click thêm vào giỏ
  const handleAdd = (product: Product) => {
    // Ép kiểu dữ liệu phù hợp với CartItem của Zustand store
    addToCart({
      id: product.id,
      title: product.title, // Đồng bộ trường name thành title như khai báo ở Store
      price: Number(product.price),
      image: product.image,
      size: product.size
    });
    toast.success(`Đã thêm ${product.title} vào giỏ hàng! 🥤`);
  };

  return (
    <>
    {/* Grid tự động chia 2 cột ở màn hình trung bình (md) trở lên */}
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
      
      {/* 🍊 NƯỚC ÉP THƯỜNG */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/90 to-yellow-100/80"></div>
        <div className="relative p-6">
          <h2 className="bg-orange-400 text-white px-6 py-2 rounded-full inline-block mb-4 shadow-lg">
            🍊 Nước ép
          </h2>
          {singleProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleAdd(prod)}
              className="flex items-center justify-between border-b border-dashed border-orange-300 py-2 px-5 cursor-pointer hover:bg-orange-200/40 rounded-lg transition duration-200 group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-14 h-14 rounded-full object-cover bg-white"
                />
                <div>
                  <p className="text-orange-500 font-semibold leading-tight group-hover:text-orange-600">
                    {prod.name}
                  </p>
                  <p className="text-orange-400 text-sm">{prod.name_en}</p>
                </div>
              </div>
              <p className="text-orange-500 font-bold text-xl">
                {Number(prod.price).toLocaleString("vi-VN")}đ
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🍹 NƯỚC ÉP MIX */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/90 to-yellow-100/80"></div>
        <div className="relative p-6">
          <h2 className="bg-green-500 text-white px-6 py-2 rounded-full inline-block mb-4 shadow-lg">
            🍹 Mix
          </h2>
          {mixProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleAdd(prod)}
              className="flex items-center justify-between border-b border-dashed border-orange-300 py-2 px-5 cursor-pointer hover:bg-green-200/40 rounded-lg transition duration-200 group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-14 h-14 rounded-full object-cover bg-white"
                />
                <div>
                  <p className="text-green-500 font-semibold leading-tight group-hover:text-green-600">
                    {prod.name}
                  </p>
                  <p className="text-green-400 text-sm">{prod.name_en}</p>
                </div>
              </div>
              <p className="text-green-500 font-bold text-xl">
                {Number(prod.price).toLocaleString("vi-VN")}đ
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🥑 SINH TỐ (Bổ sung mới) */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/90 to-pink-100/80"></div>
        <div className="relative p-6">
          <h2 className="bg-purple-500 text-white px-6 py-2 rounded-full inline-block mb-4 shadow-lg">
            🥑 Sinh tố
          </h2>
          {smoothieProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleAdd(prod)}
              className="flex items-center justify-between border-b border-dashed border-purple-300 py-2 px-5 cursor-pointer hover:bg-purple-200/40 rounded-lg transition duration-200 group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-14 h-14 rounded-full object-cover bg-white"
                />
                <div>
                  <p className="text-purple-600 font-semibold leading-tight group-hover:text-purple-700">
                    {prod.name}
                  </p>
                  <p className="text-purple-400 text-sm">{prod.name_en}</p>
                </div>
              </div>
              <p className="text-purple-600 font-bold text-xl">
                {Number(prod.price).toLocaleString("vi-VN")}đ
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🥤 THỨC UỐNG KHÁC */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/90 to-orange-100/80"></div>
        <div className="relative p-6">
          <h2 className="bg-pink-400 text-white px-6 py-2 rounded-full inline-block mb-4 shadow-lg">
            🥤 Nước uống khác
          </h2>
          {otherProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleAdd(prod)}
              className="flex items-center justify-between border-b border-dashed border-orange-300 py-2 px-5 cursor-pointer hover:bg-pink-200/40 rounded-lg transition duration-200 group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-14 h-14 rounded-full object-cover bg-white"
                />
                <div>
                  <p className="text-pink-600 font-semibold leading-tight group-hover:text-pink-700">
                    {prod.name}
                  </p>
                  <p className="text-orange-400 text-sm">{prod.name_en}</p>
                </div>
              </div>
              <p className="text-pink-600 font-bold text-xl">
                {Number(prod.price).toLocaleString("vi-VN")}đ
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
    <Toaster />
    </>
  );
}