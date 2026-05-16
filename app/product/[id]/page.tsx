"use client";

import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useCart } from "@/app/api/useCart";
import RelatedProducts from "@/app/component/RelatedProducts";
import { Toaster, toast } from "react-hot-toast";

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const benefits: any[] = product.benefits;

  const addToCart = useCart((state) => state.addToCart);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success(`Đã thêm ${product.title} vào giỏ hàng! 🥤`);
    }
  };

   // Logic cho nút Mua ngay
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if(product) {
      addToCart(product);
      router.push("/cart");
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading || !id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50">
        {/* Spinner xoay */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="absolute text-2xl animate-bounce">🥤</span>
        </div>
        <h2 className="mt-6 text-xl font-medium text-orange-800 animate-pulse">
          Đang tải nước ép tươi ngon...
        </h2>
      </div>
    );
  }

  // Giao diện khi không tìm thấy sản phẩm
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Sản phẩm không tồn tại!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-100 py-16 px-6">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-5xl font-extrabold text-orange-600 drop-shadow-sm">
          {product.title}
        </h1>
        <p className="text-lg text-gray-700 mt-4 italic">
          {product.sub_title}
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-white rounded-3xl shadow-xl p-10 transform transition duration-500 hover:scale-[1.01]">
        <div className="overflow-hidden rounded-3xl shadow-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transform hover:scale-110 transition duration-700"
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-green-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌿</span> Thông tin sản phẩm
          </h2>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="mb-8 p-4 bg-orange-50 rounded-2xl border border-orange-100">
             <div className="text-4xl font-black text-orange-500">
               <div className="flex items-center justify-between border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Giá bán
                  </span>
                  <span className="text-2xl font-bold text-green-600 mt-1">
                    {Number(product.price).toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="h-8 w-[1px] bg-gray-200"></div>

                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Khối lượng
                  </span>
                  <span className="text-sm font-bold text-pink-600 mt-1 bg-pink-50 px-3 py-1 rounded-full">
                    700ml
                  </span>
                </div>
              </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleBuyNow}
              className="bg-orange-500 text-white font-bold px-10 py-4 rounded-full shadow-lg hover:bg-orange-600 transition transform hover:scale-105 active:scale-95">
              Đặt hàng ngay
            </button>
            <button 
            onClick={handleAddToCart}
            className="bg-green-500 text-white font-bold px-10 py-4 rounded-full shadow-lg hover:bg-green-600 transition transform hover:scale-105 active:scale-95">
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-8">
        {Array.isArray(benefits) && benefits.map((benefit, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition transform hover:-translate-y-2 border-b-4 border-transparent hover:border-orange-400">
            <h3 className={`text-xl font-bold ${benefit.color} mb-3`}>
              {benefit.icon} {benefit.title}
            </h3>
            <p className="text-gray-700">{benefit.content}</p>
          </div>
        ))}
      </div>
      <RelatedProducts currentProductId={id}/>
      <Toaster />
    </div>
  );
}