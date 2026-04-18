"use client";
import { useRouter } from "next/navigation";

export default function OrderSuccess() {
  const router = useRouter();

  // Demo dữ liệu đơn hàng
  const order = {
    id: "ORD123456",
    customer: {
      name: "Nguyễn Văn A",
      phone: "0123456789",
      address: "123 Phố Hoa Quả, Hà Nội",
    },
    items: [
      { id: 1, name: "Nước ép cam", price: 30000, quantity: 2, image: "/images/products/orange-juice.png" },
      { id: 2, name: "Nước ép dưa hấu", price: 25000, quantity: 1, image: "/images/products/watermelon.png" },
    ],
  };

  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-100 py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 text-center">
        <h1 className="text-4xl font-extrabold text-green-600 mb-6">🎉 Đặt hàng thành công!</h1>
        <p className="text-gray-700 mb-8">Cảm ơn bạn đã mua hàng tại <span className="font-bold text-orange-500">Juice Fresh</span></p>

        {/* Thông tin đơn hàng */}
        <div className="text-left mb-8">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">Thông tin đơn hàng</h2>
          <p><strong>Mã đơn hàng:</strong> {order.id}</p>
          <p><strong>Khách hàng:</strong> {order.customer.name}</p>
          <p><strong>SĐT:</strong> {order.customer.phone}</p>
          <p><strong>Địa chỉ:</strong> {order.customer.address}</p>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-4 mb-8">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-orange-50 rounded-xl p-4 shadow">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg shadow" />
                <div>
                  <h3 className="font-bold text-gray-700">{item.name}</h3>
                  <p className="text-gray-600">Số lượng: {item.quantity}</p>
                </div>
              </div>
              <p className="text-orange-600 font-bold">{(item.price * item.quantity).toLocaleString()}đ</p>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="border-t pt-6 mb-8 flex justify-between text-xl font-bold text-gray-700">
          <span>Tổng cộng:</span>
          <span className="text-green-600">{total.toLocaleString()}đ</span>
        </div>

        {/* QR Code */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Quét mã QR để thanh toán đơn hàng</h2>
          <img src="/images/qr-code.png" alt="QR Code" className="mx-auto w-40 h-40 shadow-lg rounded-lg" />
        </div>

        {/* Nút hành động */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-300 text-gray-700 font-bold px-6 py-3 rounded-full shadow hover:bg-gray-400 transition"
          >
            Hủy đơn hàng
          </button>
          <button
            onClick={() => router.push("/products")}
            className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full shadow hover:bg-orange-600 transition transform hover:scale-105"
          >
            Trở về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
