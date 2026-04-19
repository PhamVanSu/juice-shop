"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../api/useCart";

interface ProductCardProps {
  id: string;
  title: string;
  price: string | number;
  image: string;
}

export default function ProductCard({ id, title, price, image }: ProductCardProps) {
  const router = useRouter();
  const addToCart = useCart((state) => state.addToCart);

  // Logic cho nút Thêm vào giỏ
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn sự kiện nổi bọt nếu bọc trong Link (nếu có)
    addToCart({ id, title, price, image });
    alert(`Đã thêm ${title} vào giỏ hàng!`);
  };

  // Logic cho nút Mua ngay
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, title, price, image });
    router.push("/cart"); // Chuyển hướng ngay tới trang giỏ hàng/thanh toán
  };

  return (
    <div className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col h-full">
      <Link href={`/product/${id}`} className="flex-grow">
        <img
          src={image}
          className="rounded-lg h-96 w-full object-cover"
          alt={title}
        />
        <h3 className="mt-3 font-semibold text-lg text-orange-400">{title}</h3>
        <p className="text-green-600 font-bold">
          {Number(price).toLocaleString("vi-VN")}đ
        </p>
      </Link>

      <div className="mt-4 flex gap-3">
      {/* Nút Mua ngay */}
  <button
    onClick={handleBuyNow}
    className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-bold 
               hover:bg-orange-600 transition active:scale-95 shadow-sm"
  >
    Mua ngay
  </button>

  {/* Nút Thêm vào giỏ */}
  <button
    onClick={handleAddToCart}
    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium 
               hover:bg-green-700 transition active:scale-95 shadow-sm"
  >
    Thêm vào giỏ
  </button>


</div>
    </div>
  );
}