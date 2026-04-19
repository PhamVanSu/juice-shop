"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function RelatedProducts({ currentProductId }: { currentProductId: string }) {
  const router = useRouter();
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const q = query(collection(db, "products"), limit(10));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          // Lọc bỏ sản phẩm hiện tại
          .filter(product => product.id !== currentProductId);
        
        setRelatedProducts(products);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm liên quan:", error);
      }
    };

    fetchRelated();
  }, [currentProductId]);

  if (relatedProducts.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <h2 className="text-3xl font-bold text-green-600 mb-10 text-center underline decoration-orange-300 underline-offset-8">
        Các sản phẩm khác
      </h2>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        // navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="pb-12" // Tạo khoảng trống cho pagination dot
      >
        {relatedProducts.map((item) => (
          <SwiperSlide key={item.id}>
            <div 
              onClick={() => router.push(`/product/${item.id}`)}
              className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition group cursor-pointer border border-orange-50 h-full flex flex-col justify-between"
            >
              <div className="relative mb-4 overflow-hidden rounded-xl">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-40 object-cover group-hover:scale-110 transition duration-500" 
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-700 group-hover:text-orange-500 transition line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-orange-500 font-extrabold mt-2">
                  {Number(item.price).toLocaleString()}đ
                </p>
              </div>
              <button className="mt-4 text-sm font-medium text-green-600 hover:text-green-700 cursor-pointer">
                Xem chi tiết →
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Tùy chỉnh màu cho Swiper (Thêm vào global CSS hoặc dùng style tag) */}
      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
          color: #f97316 !important; /* orange-500 */
          transform: scale(0.6);
        }
        .swiper-pagination-bullet-active {
          background: #16a34a !important; /* green-600 */
        }
      `}</style>
    </div>
  );
}