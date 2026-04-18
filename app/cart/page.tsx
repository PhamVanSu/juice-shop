"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Nước ép cam", price: 30000, quantity: 2, image: "/images/products/orange-juice.png", comment: "" },
    { id: 2, name: "Nước ép dưa hấu", price: 25000, quantity: 1, image: "/images/products/watermelon.png", comment: "" },
  ]);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = (id, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(newQuantity, 1) } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateComment = (id, newComment) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, comment: newComment } : item
      )
    );
  };

  const handleCheckout = () => {
    // Thực tế: lưu đơn hàng vào Firestore kèm customerInfo
    router.push("/checkout");
  };

  const handleContinueShopping = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-100 py-16 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-extrabold text-orange-600 mb-8 text-center">Giỏ Hàng</h1>

        {/* Danh sách sản phẩm */}
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row md:items-center justify-between bg-orange-50 rounded-xl p-4 shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg shadow" />
                <div>
                  <h2 className="text-lg font-bold text-gray-700">{item.name}</h2>
                  <p className="text-gray-600">Giá: {item.price.toLocaleString()}đ</p>
                  {/* Chỉnh số lượng */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
                <p className="text-orange-600 font-bold text-xl">
                  {(item.price * item.quantity).toLocaleString()}đ
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold"
                >
                  Xóa
                </button>
              </div>
              {/* Comment */}
              <div className="mt-4 w-full">
                <textarea
                  value={item.comment}
                  onChange={(e) => updateComment(item.id, e.target.value)}
                  placeholder="Thêm ghi chú cho sản phẩm..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="mt-10 flex justify-between items-center border-t pt-6">
          <h2 className="text-2xl font-bold text-gray-700">Tổng cộng:</h2>
          <p className="text-2xl font-bold text-green-600">{total.toLocaleString()}đ</p>
        </div>

        {/* Thông tin người đặt */}
        <div className="mt-10 bg-green-50 rounded-xl p-6 shadow">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Thông tin người đặt</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Họ và tên"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
            />
            <textarea
              placeholder="Địa chỉ"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        {/* Nút hành động */}
        <div className="mt-8 flex justify-center gap-6">
          <button
            onClick={handleContinueShopping}
            className="bg-gray-300 text-gray-700 font-bold px-6 py-3 rounded-full shadow hover:bg-gray-400 transition"
          >
            Tiếp tục mua hàng
          </button>
          <button
            onClick={handleCheckout}
            className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full shadow hover:bg-orange-600 transition transform hover:scale-105"
          >
            Đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
}
