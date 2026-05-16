"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  doc,
  updateDoc 
} from "firebase/firestore";

// Danh sách các trạng thái xử lý đơn hàng
const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700 ring-yellow-200" },
  { value: "processing", label: "Đang làm", color: "bg-blue-100 text-blue-700 ring-blue-200" },
  { value: "done", label: "Hoàn tất", color: "bg-green-100 text-green-700 ring-green-200" },
  { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-700 ring-red-200" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"today" | "all">("today");

  useEffect(() => {
    setLoading(true);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(startOfDay);

    let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    if (filterMode === "today") {
      q = query(q, where("createdAt", ">=", todayTimestamp));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filterMode]);

  // Hàm cập nhật trạng thái đơn hàng lên Firebase
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Không thể cập nhật trạng thái!");
    }
  };

  // Hàm cập nhật trạng thái THANH TOÁN (Toggle giữa true / false)
  const handleTogglePayment = async (orderId: string, currentPaidStatus: boolean) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        isPaid: !currentPaidStatus,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Lỗi cập nhật thanh toán:", error);
      alert("Không thể cập nhật trạng thái thanh toán!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Bộ lọc thời gian */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 px-2 sm:px-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Danh sách Đơn hàng</h1>
          <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200 w-full sm:w-auto">
            {["today", "all"].map((mode) => (
              <button 
                key={mode}
                onClick={() => setFilterMode(mode as any)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition text-center ${
                  filterMode === mode ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {mode === "today" ? "Hôm nay" : "Tất cả"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 italic bg-white rounded-xl border">Đang tải dữ liệu đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400 italic bg-white rounded-xl border">Chưa có đơn hàng nào.</div>
        ) : (
          <>
            {/* ================= GIAO DIỆN TRÊN ĐIỆN THOẠI (MOBILE CARD VIEW) ================= */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {orders.map((order) => {
                const isPaid = order.isPaid === true;
                const formattedDate = order.createdAt?.toDate().toLocaleString("vi-VN", {
                  day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
                });

                return (
                  <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
                    {/* Hàng 1: Mã đơn & Thời gian */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-[14px] font-bold text-red-600 uppercase">#{order.orderCode}</span>
                      <span className="text-xs text-gray-500 font-medium">{formattedDate}</span>
                    </div>

                    {/* Hàng 2: Thông tin khách hàng */}
                    <div>
                      <div className="font-bold text-gray-800 text-base">{order.customer?.name}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{order.customer?.phone}</div>
                      {order.customer?.address && (
                        <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-1.5 rounded border border-gray-100">
                          📍 {order.customer?.address}
                        </div>
                      )}
                    </div>

                    {/* Hàng 3: Danh sách món uống */}
                    <div className="space-y-1.5 my-1">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="text-[13px] text-gray-700 bg-blue-50/70 px-3 py-1.5 rounded border border-blue-100/60">
                          <span className="font-bold text-orange-600 mr-1">{item.quantity}x</span> {item.title}
                          {item.comment && (
                            <div className="text-xs text-blue-500 italic mt-0.5 block pl-4 border-l-2 border-blue-300">
                              💬 {item.comment}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Hàng 4: Tổng tiền thanh toán */}
                    <div className="flex justify-between items-center bg-orange-50/30 p-2 rounded-lg border border-dashed border-orange-200">
                      <span className="text-sm text-gray-500 font-medium">Tổng tiền:</span>
                      <span className="font-black text-lg text-green-600">
                        {Number(order.totalAmount).toLocaleString()}đ
                      </span>
                    </div>

                    {/* Hàng 5: Các nút tương tác, đổi trạng thái nhanh */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 mt-1">
                      {/* Trạng thái trả tiền */}
                      <button
                        onClick={() => handleTogglePayment(order.id, isPaid)}
                        className={`text-xs font-bold uppercase py-2.5 rounded-lg border shadow-sm text-center transition ${
                          isPaid 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {isPaid ? "✅ Đã trả" : "❌ Chưa trả"}
                      </button>

                      {/* Trạng thái làm nước */}
                      <div className="relative">
                        <select 
                          value={order.status || "pending"}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`w-full text-center text-xs font-bold uppercase py-2.5 rounded-lg border-none outline-none ring-1 ring-inset shadow-sm transition appearance-none ${
                            STATUS_OPTIONS.find(s => s.value === (order.status || "pending"))?.color || "bg-gray-100"
                          }`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white text-gray-800 normal-case">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* ================= GIAO DIỆN TRÊN MÁY TÍNH (DESKTOP TABLE VIEW) ================= */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[11px]">
                      <th className="p-4">Thời gian</th>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Sản phẩm & Ghi chú</th>
                      <th className="p-4">Tổng tiền</th>
                      <th className="p-4 text-center">Thanh toán</th>
                      <th className="p-4 text-center">Trạng thái xử lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => {
                      const isPaid = order.isPaid === true;
                      
                      return (
                        <tr key={order.id} className="hover:bg-orange-50/20 transition-colors align-top">
                          {/* Thời gian */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-bold text-gray-700">
                              {order.createdAt?.toDate().toLocaleString("vi-VN", {
                                day: "2-digit", month: "2-digit", year: "numeric", hour12: false 
                              })}
                              {" - "}
                              {order.createdAt?.toDate().toLocaleString("vi-VN", {
                                hour: "2-digit", minute: "2-digit", hour12: false 
                              })}
                            </div>
                            <div className="text-[15px] text-red-600 uppercase mt-1">
                              #{order.orderCode}
                            </div>
                          </td>

                          {/* Khách hàng */}
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{order.customer?.name}</div>
                            <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                            <div className="text-[11px] text-gray-400 mt-1 max-w-[180px] truncate" title={order.customer?.address}>
                              {order.customer?.address}
                            </div>
                          </td>

                          {/* Sản phẩm */}
                          <td className="p-4">
                            <div className="space-y-1.5">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="text-[13px] text-gray-700 bg-blue-50 px-4 py-1 rounded border border-blue-100">
                                  <span className="font-bold text-orange-600 mr-1">{item.quantity}x</span> {item.title}
                                  {item.comment && (
                                    <div className="text-[11px] text-blue-500 italic mt-0.5 inline-block w-full">
                                      💬 {item.comment}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Tiền */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-black text-green-600 text-base">
                              {Number(order.totalAmount).toLocaleString()}đ
                            </div>
                          </td>

                          {/* Thanh toán */}
                          <td className="p-4 text-center whitespace-nowrap min-w-[130px]">
                            <button
                              onClick={() => handleTogglePayment(order.id, isPaid)}
                              className={`text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg border shadow-sm transition-all duration-200 ${
                                isPaid 
                                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                                  : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                              }`}
                            >
                              {isPaid ? "✅ Đã trả tiền" : "❌ Chưa trả"}
                            </button>
                          </td>

                          {/* Trạng thái xử lý */}
                          <td className="p-4 text-center min-w-[140px]">
                            <select 
                              value={order.status || "pending"}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              className={`text-[11px] font-bold uppercase px-2 py-1.5 rounded-lg border-none outline-none ring-1 ring-inset shadow-sm cursor-pointer transition ${
                                STATUS_OPTIONS.find(s => s.value === (order.status || "pending"))?.color || "bg-gray-100"
                              }`}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-white text-gray-800 font-sans normal-case">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}