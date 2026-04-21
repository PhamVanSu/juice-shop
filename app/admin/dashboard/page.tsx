"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { HiOutlineCheckCircle, HiOutlineCash, HiOutlineCalendar } from "react-icons/hi";

type FilterType = "day" | "month" | "year";

export default function AdminStatistics() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>("day");
  const [loading, setLoading] = useState(true);

  // 1. Lấy tất cả đơn hàng có trạng thái "done"
  useEffect(() => {
    const fetchDoneOrders = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "orders"),
          where("status", "==", "done"),
          // orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        setOrders(data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoneOrders();
  }, []);

  // 2. Logic lọc đơn hàng theo thời gian dựa trên tab đang chọn
  useEffect(() => {
    const now = new Date();
    const filtered = orders.filter(order => {
      const orderDate: Date = order.createdAt;
      if (filter === "day") {
        return orderDate.toDateString() === now.toDateString();
      } else if (filter === "month") {
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      } else if (filter === "year") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
    setFilteredOrders(filtered);
  }, [filter, orders]);

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Thống kê Quyết toán</h1>
            <p className="text-gray-500">Chỉ hiển thị các đơn hàng đã hoàn tất (Done)</p>
          </div>
          
          {/* Bộ lọc Tab */}
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
            {(["day", "month", "year"] as FilterType[]).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === t ? "bg-orange-500 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "day" ? "Hôm nay" : t === "month" ? "Tháng này" : "Năm nay"}
              </button>
            ))}
          </div>
        </header>

        {/* Thẻ tóm tắt doanh số */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="p-4 bg-green-100 text-green-600 rounded-2xl"><HiOutlineCash size={32}/></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Doanh thu kết quả</p>
              <p className="text-3xl font-black text-gray-800">{totalRevenue.toLocaleString()}đ</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><HiOutlineCheckCircle size={32}/></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Số đơn hoàn tất</p>
              <p className="text-3xl font-black text-gray-800">{filteredOrders.length} đơn</p>
            </div>
          </div>
        </div>

        {/* Bảng danh sách đơn hàng chi tiết */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-700">Chi tiết giao dịch</h2>
            <div className="text-xs text-gray-400 font-medium italic">
              * Dữ liệu được cập nhật thời gian thực
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">Thời gian</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">Khách hàng</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">Chi tiết món</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-20 text-center text-gray-400">Đang truy xuất dữ liệu...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-gray-400">Không tìm thấy đơn hàng hoàn tất nào trong thời gian này.</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <HiOutlineCalendar className="text-gray-300" />
                          {order.createdAt.toLocaleDateString("vi-VN")}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 ml-6 uppercase">
                          {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-gray-800">{order.customer?.name}</div>
                        <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-[300px]">
                          {order.items?.map((item: any, idx: number) => (
                            <span key={idx} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md mr-1 mb-1 inline-block">
                              {item.quantity}x {item.title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-sm font-black text-orange-600">
                          {Number(order.totalAmount).toLocaleString()}đ
                        </div>
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