"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useCart } from "../api/useCart";

export default function CartPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy dữ liệu và các hàm từ Zustand Store
  const cart = useCart((state) => state.cart);
  const removeFromCart = useCart((state) => state.removeFromCart);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const clearCart = useCart((state) => state.clearCart);
  
  // Tính tổng tiền
  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  // State cho thông tin người đặt
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

const handleOrder = async () => {
  if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
    alert("Vui lòng điền đầy đủ thông tin giao hàng!");
    return;
  }

  if (cart.length === 0) {
    alert("Giỏ hàng đang trống!");
    return;
  }

  setIsSubmitting(true);

  try {
    const orderData = {
      customer: {
        name: customerInfo.name || "",
        phone: customerInfo.phone || "",
        address: customerInfo.address || "",
      },
      items: cart.map(item => ({
        productId: item.id || item.cartId || "no-id", 
        title: item.title || "Sản phẩm không tên",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || ""
      })),
      totalAmount: total || 0,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);

    clearCart();
    router.push(`/order/${docRef.id}`);
    
  } catch (error) {
    alert("Có lỗi xảy ra khi lưu đơn hàng. Vui lòng kiểm tra console!");
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-100 py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        <h1 className="text-4xl font-extrabold text-orange-600 mb-8 text-center">Xác Nhận Đơn Hàng</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 mb-6">Giỏ hàng của bạn đang trống.</p>
            <button onClick={() => router.push("/")} className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold">
              Quay lại thực đơn
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Danh sách sản phẩm tách dòng */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.cartId} className="flex items-center justify-between bg-orange-50 rounded-xl p-4 border border-orange-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover shadow" />
                    <div>
                      <h2 className="font-bold text-gray-700">{item.title}</h2>
                      <p className="text-sm text-gray-500">{Number(item.price).toLocaleString()}đ</p>
                      <div className="flex items-center gap-2 mt-1 text-gray-400">
                        <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="bg-white w-6 h-6 rounded-full border border-gray-400">-</button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="bg-white w-6 h-6 rounded-full border border-gray-400">+</button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600 font-bold">{(Number(item.price) * item.quantity).toLocaleString()}đ</p>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 text-xs hover:underline mt-1">Xóa</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng cộng */}
            <div className="flex justify-between items-center py-4 border-t border-b border-dashed border-orange-200">
              <span className="text-xl font-bold text-gray-600">Tổng thanh toán:</span>
              <span className="text-3xl font-black text-green-600">{total.toLocaleString()}đ</span>
            </div>

            {/* Form thông tin khách hàng */}
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 space-y-4 text-gray-500">
              <h3 className="font-bold text-green-700 text-lg flex items-center gap-2">📍 Thông tin giao nhận</h3>
              <input
                type="text"
                placeholder="Tên người nhận"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              />
              <textarea
                placeholder="Địa chỉ giao hàng chi tiết"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none"
                rows={3}
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
              />
            </div>

            {/* Nút hành động */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => router.push("/")}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-full font-bold hover:bg-gray-200 transition"
              >
                Tiếp tục mua
              </button>
              <button
                onClick={handleOrder}
                disabled={isSubmitting}
                className={`flex-1 text-white py-4 rounded-full font-bold shadow-lg transition transform hover:scale-105 ${isSubmitting ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt hàng ngay 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}