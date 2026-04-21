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

// Danh sách các trạng thái có thể có
const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  { value: "processing", label: "Đang làm", color: "bg-blue-100 text-blue-700" },
  { value: "done", label: "Hoàn tất", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-700" },
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

  // Hàm cập nhật trạng thái lên Firebase
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      // Vì dùng onSnapshot nên giao diện sẽ tự cập nhật ngay lập tức
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Không thể cập nhật trạng thái!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Danh sách Đơn hàng</h1>
          <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            {["today", "all"].map((mode) => (
              <button 
                key={mode}
                onClick={() => setFilterMode(mode as any)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition capitalize ${
                  filterMode === mode ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {mode === "today" ? "Hôm nay" : "Tất cả"}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[11px]">
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Sản phẩm & Ghi chú</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4 text-center">Trạng thái xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Đang tải dữ liệu...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Chưa có đơn hàng nào.</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-orange-50/20 transition-colors align-top">
                      {/* Thời gian */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-gray-700">
                          {order.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase mt-1">
                          #{order.id.slice(-6)}
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{order.customer?.name}</div>
                        <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                        <div className="text-[11px] text-gray-400 mt-1 max-w-[150px] truncate" title={order.customer?.address}>
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
                                <div className="text-[11px] text-blue-500 italic mt-0.5  inline-block w-full">
                                  💬 {item.comment}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Tiền */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-black text-green-600">
                          {Number(order.totalAmount).toLocaleString()}đ
                        </div>
                      </td>

                      {/* UPDATE STATUS */}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}