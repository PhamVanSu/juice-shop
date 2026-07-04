"use client";

import { useState, useEffect, useMemo } from "react";
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
import * as XLSX from "xlsx"; // <-- Import thư viện SheetJS để làm việc với Excel

// Danh sách các trạng thái xử lý đơn hàng
const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700 ring-yellow-200" },
  { value: "processing", label: "Đang làm", color: "bg-blue-100 text-blue-700 ring-blue-200" },
  { value: "done", label: "Hoàn tất", color: "bg-green-100 text-green-700 ring-green-200" },
  { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-700 ring-red-200" },
];

const ITEMS_PER_PAGE = 10; // Số lượng đơn hàng hiển thị trên một trang

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"today" | "custom">("today");
  
  // State phục vụ filter nâng cao
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all"); 

  // State phục vụ phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Khởi tạo ngày hôm nay mặc định cho ô input khi chọn custom
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
  }, []);

  // Effect fetch dữ liệu từ Firestore
  useEffect(() => {
    setLoading(true);
    setCurrentPage(1); 

    let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    if (filterMode === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      q = query(q, where("createdAt", ">=", Timestamp.fromDate(startOfDay)));
    } else if (filterMode === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      q = query(
        q, 
        where("createdAt", ">=", Timestamp.fromDate(start)),
        where("createdAt", "<=", Timestamp.fromDate(end))
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filterMode, startDate, endDate]);

  // Xử lý bộ lọc trạng thái thanh toán + TRẠNG THÁI ĐƠN HÀNG tại Client
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesPayment = 
        paymentFilter === "all" ||
        (paymentFilter === "paid" && order.isPaid === true) ||
        (paymentFilter === "unpaid" && order.isPaid !== true);

      const matchesStatus = 
        statusFilter === "all" || 
        (order.status || "pending") === statusFilter;

      return matchesPayment && matchesStatus;
    });
  }, [orders, paymentFilter, statusFilter]);

  // Tính toán dữ liệu phân trang
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredOrders, totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [paymentFilter, statusFilter]);

  // --- HÀM XUẤT FILE EXCEL TỪ DATA ĐANG QUERY ---
  const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
      alert("Không có dữ liệu phù hợp để xuất Excel!");
      return;
    }

    // 1. Định dạng cấu trúc các cột cho file Excel đầu ra
    const excelData = filteredOrders.map((order) => {
      // Định dạng ngày giờ
      const dateStr = order.createdAt?.toDate()
        ? order.createdAt.toDate().toLocaleString("vi-VN")
        : "";
      
      // Gộp danh sách các món uống thành chuỗi văn bản
      const itemsStr = order.items
        ?.map((item: any) => `${item.quantity}x ${item.title}${item.comment ? ` (Ghi chú: ${item.comment})` : ""}`)
        .join(", ");

      // Tìm nhãn tiếng Việt của trạng thái
      const statusLabel = STATUS_OPTIONS.find(s => s.value === (order.status || "pending"))?.label || "Chờ xử lý";

      return {
        "Mã Đơn Hàng": `#${order.orderCode || ""}`,
        "Thời Gian": dateStr,
        "Tên Khách Hàng": order.customer?.name || "Ẩn danh",
        "Số Điện Thoại": order.customer?.phone || "",
        "Địa Chỉ Giao Hàng": order.customer?.address || "",
        "Chi Tiết Sản Phẩm": itemsStr || "",
        "Tổng Tiền (đ)": Number(order.totalAmount) || 0,
        "Thanh Toán": order.isPaid === true ? "Đã trả tiền" : "Chưa trả tiền",
        "Trạng Thái Xử Lý": statusLabel,
      };
    });

    // 2. Tạo workbook và worksheet từ json dữ liệu đã định dạng
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách đơn hàng");

    // Tự động điều chỉnh độ rộng cột cơ bản để file đẹp hơn
    const maxColsWidth = [{ wch: 15 }, { wch: 22 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    worksheet["!cols"] = maxColsWidth;

    // 3. Tiến hành tải tệp tin về máy client
    const fileName = `DonHang_${filterMode === "today" ? "HomNay" : `${startDate}_den_${endDate}`}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

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

  // Hàm cập nhật trạng thái THANH TOÁN
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
        
        {/* Header & Bộ lọc thời gian chính */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4 px-2 sm:px-0 bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center lg:block w-full lg:w-auto">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Danh sách Đơn hàng</h1>
              <p className="text-xs text-gray-500 mt-1">Tìm thấy {filteredOrders.length} đơn hàng</p>
            </div>
            
            {/* NÚT XUẤT EXCEL TRÊN MOBILE */}
            <button
              onClick={handleExportExcel}
              className="lg:hidden bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition"
            >
              📊 Xuất Excel
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
            {/* NÚT XUẤT EXCEL TRÊN PC */}
            <button
              onClick={handleExportExcel}
              className="hidden lg:flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-2 px-4 rounded-lg shadow-sm transition mr-2"
            >
              <span>📊</span> Xuất Excel
            </button>

            {/* Switch chế độ lọc ngày */}
            <div className="flex bg-gray-100 p-1 rounded-lg border w-full sm:w-auto">
              <button 
                onClick={() => setFilterMode("today")}
                className={`px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold transition text-center flex-1 sm:flex-none whitespace-nowrap ${
                  filterMode === "today" ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                Hôm nay
              </button>
              <button 
                onClick={() => setFilterMode("custom")}
                className={`px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold transition text-center flex-1 sm:flex-none whitespace-nowrap ${
                  filterMode === "custom" ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                Khoảng ngày
              </button>
            </div>

            {/* Inputs cho Khoảng ngày (chỉ hiện khi chọn custom) */}
            {filterMode === "custom" && (
              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border text-xs">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer"
                />
                <span className="text-gray-400">đến</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer"
                />
              </div>
            )}
            
            {/* Bộ lọc trạng thái đơn hàng */}
            <div className="flex items-center bg-gray-50 rounded-lg border px-2">
              <span className="text-xs text-gray-400 mr-1 hidden sm:inline">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-gray-700 font-semibold py-2 cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bộ lọc thanh toán */}
            <div className="flex items-center bg-gray-50 rounded-lg border px-2">
              <span className="text-xs text-gray-400 mr-1 hidden sm:inline">Thanh toán:</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="bg-transparent border-none outline-none text-xs text-gray-700 font-semibold py-2 cursor-pointer"
              >
                <option value="all">Tất cả đơn</option>
                <option value="paid">✅ Đã thanh toán</option>
                <option value="unpaid">❌ Chưa thanh toán</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 italic bg-white rounded-xl border">Đang tải dữ liệu đơn hàng...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-gray-400 italic bg-white rounded-xl border">Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</div>
        ) : (
          <>
            {/* ================= GIAO DIỆN TRÊN ĐIỆN THOẠI (MOBILE CARD VIEW) ================= */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {paginatedOrders.map((order) => {
                const isPaid = order.isPaid === true;
                const formattedDate = order.createdAt?.toDate().toLocaleString("vi-VN", {
                  day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
                });

                return (
                  <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-[14px] font-bold text-red-600 uppercase">#{order.orderCode}</span>
                      <span className="text-xs text-gray-500 font-medium">{formattedDate}</span>
                    </div>

                    <div>
                      <div className="font-bold text-gray-800 text-base">{order.customer?.name}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{order.customer?.phone}</div>
                      {order.customer?.address && (
                        <div className="text-xs text-gray-400 mt-1 bg-gray-50 p-1.5 rounded border border-gray-100">
                          📍 {order.customer?.address}
                        </div>
                      )}
                    </div>

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

                    <div className="flex justify-between items-center bg-orange-50/30 p-2 rounded-lg border border-dashed border-orange-200">
                      <span className="text-sm text-gray-500 font-medium">Tổng tiền:</span>
                      <span className="font-black text-lg text-green-600">
                        {Number(order.totalAmount).toLocaleString()}đ
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 mt-1">
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
                    {paginatedOrders.map((order) => {
                      const isPaid = order.isPaid === true;
                      
                      return (
                        <tr key={order.id} className="hover:bg-orange-50/20 transition-colors align-top">
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

                          <td className="p-4">
                            <div className="font-bold text-gray-800">{order.customer?.name}</div>
                            <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                            <div className="text-[11px] text-gray-400 mt-1 max-w-[180px] truncate" title={order.customer?.address}>
                              {order.customer?.address}
                            </div>
                          </td>

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

                          <td className="p-4 whitespace-nowrap">
                            <div className="font-black text-green-600 text-base">
                              {Number(order.totalAmount).toLocaleString()}đ
                            </div>
                          </td>

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

            {/* ================= THANH PHÂN TRANG (PAGINATION BAR) ================= */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-2 sm:px-0">
                <span className="text-xs md:text-sm text-gray-500">
                  Trang <span className="font-bold text-gray-800">{currentPage}</span> / {totalPages}
                </span>
                
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition ${
                      currentPage === 1 
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Trước
                  </button>
                  
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition ${
                      currentPage === totalPages 
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}