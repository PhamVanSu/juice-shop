"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrderSuccess() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string; // Lấy ID từ URL (ví dụ: /order-success/[id])

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
  try {
    setLoading(true);
    setError(""); // Reset lỗi mỗi lần fetch mới
    
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Kiểm tra điều kiện status khác "cancelled"
      if (data.status !== "cancelled") {
        setOrder({ id: docSnap.id, ...data });
      } else {
        // Cập nhật thông báo lỗi khi đơn hàng bị hủy
        setError("Đơn hàng này đã bị hủy. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.");
        setOrder(null);
      }
    } else {
      // Cập nhật thông báo lỗi khi không tìm thấy ID
      setError("Mã đơn hàng không tồn tại trên hệ thống.");
      setOrder(null);
    }
  } catch (err) {
    console.error("Lỗi hệ thống:", err);
    setError("Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
  } finally {
    setLoading(false);
  }
};

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
        <p className="ml-4 text-green-700 font-medium">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
        <h1 className="text-2xl font-bold text-red-500">Hệ thống không tìm thấy đơn hàng này!</h1>
        <button onClick={() => router.push("/")} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full">
          Trở về trang chủ
        </button>
      </div>
    );
  }

  if (error) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 border border-red-200 p-8 rounded-2xl shadow-sm">
        <span className="text-5xl mb-4 block">⚠️</span>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Rất tiếc!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => router.push("/")}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}

  const handleCancelOrder = async () => {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      status: "cancelled",
      cancelledAt: new Date(),
    });

    alert("Bạn đã huỷ đơn hàng");
    router.push("/")
  } catch (error) {
    console.error(error);
    alert("Huỷ đơn thất bại");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-100 py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-4xl font-extrabold text-green-600 mb-6">Đặt hàng thành công!</h1>
        <p className="text-gray-700 mb-8">
          Cảm ơn bạn đã mua hàng tại <span className="font-bold text-orange-500">Nhà Su</span>
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Thông tin đơn hàng */}
          <div className="text-left bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h2 className="text-xl font-bold text-orange-600 mb-4 border-b border-orange-200 pb-2">📦 Chi tiết đơn hàng</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Mã đơn:</strong> <span className="text-sm font-mono">{order.id}</span></p>
              <p><strong>Khách hàng:</strong> {order.customer?.name}</p>
              <p><strong>SĐT:</strong> {order.customer?.phone}</p>
              <p><strong>Địa chỉ:</strong> {order.customer?.address}</p>
              <p><strong>Trạng thái:</strong> <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs uppercase font-bold">{order.status}</span></p>
            </div>
          </div>

          {/* QR Code thanh toán */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Quét mã QR thanh toán</h2>
            <div className="bg-gray-100 w-40 h-40 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                {/* Thay src bằng link API QR thực tế nếu cần */}
                <img src="/images/qr-code.png" alt="QR Code" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">TP Bank: 522 6789 9999</p>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-4 mb-8">
          <h2 className="text-left text-xl font-bold text-gray-700 ml-2">🍎 Sản phẩm đã chọn</h2>
          {order.items?.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover shadow-sm" />
                <div className="text-left">
                  <h3 className="font-bold text-gray-700">{item.title} {item.comment && `(${item.comment})`}</h3>
                  <p className="text-sm text-gray-500">
                    {Number(item.price).toLocaleString()}đ x {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-orange-600 font-bold">
                {(Number(item.price) * item.quantity).toLocaleString()}đ
              </p>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="border-t-2 border-dashed pt-6 mb-8 flex justify-between items-center text-2xl font-bold text-gray-800">
          <span>Tổng thanh toán:</span>
          <span className="text-green-600 font-black">{Number(order.totalAmount).toLocaleString()}đ</span>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-200 text-gray-700 font-bold px-10 py-4 rounded-full hover:bg-gray-300 transition"
          >
            Về trang chủ
          </button>
          <button
            onClick={() => handleCancelOrder()}
            className="bg-orange-600 text-white font-bold px-10 py-4 rounded-full shadow-lg hover:bg-orange-700 transition"
          >
            Huỷ đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}