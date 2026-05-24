"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  { value: "processing", label: "Đang làm", color: "bg-blue-100 text-blue-700" },
  { value: "done", label: "Hoàn tất", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-700" },
];

export default function OrderSuccess() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string; 

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    setError(""); 

    const docRef = doc(db, "orders", orderId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.status === "cancelled") {
            setError("Đơn hàng này đã bị hủy. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.");
            setOrder(null);
          } else {
            setOrder({ id: docSnap.id, ...data });
            setError("");
          }
        } else {
          setError("Mã đơn hàng không tồn tại trên hệ thống.");
          setOrder(null);
        }
      } catch (err) {
        console.error("Lỗi xử lý dữ liệu:", err);
        setError("Đã có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Lỗi lắng nghe Firestore:", err);
      setError("Mất kết nối với máy chủ. Vui lòng thử lại.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
        <p className="ml-4 text-green-700 font-medium">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-green-50">
        <div className="bg-white border border-red-200 p-8 rounded-2xl shadow-sm max-w-md w-full">
          <span className="text-5xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Rất tiếc!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push("/")}
            className="w-full bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition"
          >
            Quay lại trang chủ
          </button>
        </div>
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

  const handleCancelOrder = async () => {
    if (order.status !== "pending") {
      alert("Nhà Su đã bắt đầu chế biến nước ép nên không thể hủy đơn hàng này. Xin lỗi bạn vì sự bất tiện này!");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      return; 
    }

    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "cancelled",
        cancelledAt: new Date(),
      });
      alert("Bạn đã huỷ đơn hàng thành công");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Huỷ đơn thất bại, vui lòng thử lại sau!");
    }
  };

  const currentStatus = STATUS_OPTIONS.find((opt) => opt.value === order.status);
  const isPaid = order.isPaid === true; 

  // --- LOGIC TỰ ĐỘNG TẠO LINK QR CODE ĐỘNG ---
  // Định dạng VietQR: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
  const bankId = "bidv"; // Mã ngân hàng BIDV định dạng chuẩn ngân hàng
  const accountNumber = "1990628358";
  const accountName = encodeURIComponent("NGUYEN PHUONG THAO");
  const amount = order.totalAmount || 0;
  // Nội dung chuyển khoản: Mã đơn hàng (Loại bỏ ký tự khoảng trắng thừa nếu có)
  const description = encodeURIComponent(`${order.orderCode || orderId}`);
  
  // Sử dụng template 'qr_only' để chỉ hiển thị mã QR gọn gàng hoặc 'compact2' để có kèm logo ngân hàng
  const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${accountName}`;

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
              <p><strong>Mã đơn:</strong> <span className="text-sm font-mono font-bold text-gray-800">{order.orderCode}</span></p>
              <p><strong>Khách hàng:</strong> {order.customer?.name}</p>
              <p><strong>SĐT:</strong> {order.customer?.phone}</p>
              <p><strong>Địa chỉ:</strong> {order.customer?.address}</p>
              <p><strong>Trạng thái:</strong> <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${currentStatus?.color || 'bg-gray-100'}`}>{currentStatus?.label}</span></p>
              <p><strong>Thanh toán:</strong> {isPaid ? "✅ Đã trả tiền" : "❌ Chưa trả"}</p>
            </div>
          </div>

          {/* QR Code tự động sinh động */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <h2 className="text-lg font-bold text-gray-700 mb-3">Quét mã QR để thanh toán</h2>
            
            <div className="bg-white w-60 h-60 rounded-xl flex items-center justify-center border-2 border-dashed border-orange-200 p-2 shadow-inner">
              {/* Ảnh QR tĩnh cũ đã được thay thế bằng URL QR động từ API VietQR */}
              <img 
                src={qrCodeUrl} 
                alt="Mã QR Thanh toán Nhà Su" 
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
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
                    Giá: {Number(item.price).toLocaleString()}đ x {item.quantity} cốc - Khối lượng: {item.size}
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
          
          {order.status === "pending" && (
            <button
              onClick={handleCancelOrder}
              className="bg-orange-600 text-white font-bold px-10 py-4 rounded-full shadow-lg hover:bg-orange-700 transition"
            >
              Huỷ đơn hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}