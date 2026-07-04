"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { HiOutlineCheckCircle, HiOutlineCash, HiOutlineCalendar, HiChevronLeft, HiChevronRight, HiOutlineTrendingUp } from "react-icons/hi";

type FilterType = "day" | "month" | "year" | "custom";

interface ProductSales {
  title: string;
  quantity: number;
  revenue: number;
  image?: string;
}

export default function AdminStatistics() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>("day");
  const [loading, setLoading] = useState(true);

  // --- State phục vụ lọc khoảng ngày tùy chỉnh ---
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // --- State phục vụ Phân trang ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Số lượng đơn hàng hiển thị trên mỗi trang

  // Khởi tạo ngày mặc định cho bộ lọc khoảng ngày (Hôm nay)
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
  }, []);

  // 1. Lấy tất cả đơn hàng có trạng thái "done"
  useEffect(() => {
    const fetchDoneOrders = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "orders"),
          where("status", "==", "done")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Sắp xếp đơn hàng mới nhất lên đầu trước khi đưa vào lưu trữ
        data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setOrders(data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoneOrders();
  }, []);

  // 2. Logic lọc đơn hàng sử dụng useMemo để tối ưu hiệu năng
  const filteredOrders = useMemo(() => {
    const now = new Date();
    
    return orders.filter(order => {
      const orderDate: Date = order.createdAt;
      
      if (filter === "day") {
        return orderDate.toDateString() === now.toDateString();
      } 
      
      if (filter === "month") {
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      } 
      
      if (filter === "year") {
        return orderDate.getFullYear() === now.getFullYear();
      }

      if (filter === "custom" && startDate && endDate) {
        // Chuẩn hóa ngày bắt đầu về 00:00:00.000
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        // Chuẩn hóa ngày kết thúc về 23:59:59.999
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return orderDate >= start && orderDate <= end;
      }
      
      return true;
    });
  }, [filter, orders, startDate, endDate]);

  // Reset về trang 1 mỗi khi đổi bộ lọc thời gian
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, startDate, endDate]);

  // --- LOGIC TỔNG HỢP DOANH THU ---
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // --- LOGIC TỔNG HỢP SẢN PHẨM ĐÃ BÁN ---
  const productSalesMap = filteredOrders.reduce((acc: { [key: string]: ProductSales }, order) => {
    order.items?.forEach((item: any) => {
      const title = item.title;
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;

      if (!acc[title]) {
        acc[title] = {
          title: title,
          quantity: 0,
          revenue: 0,
          image: item.image // Lưu lại ảnh để hiển thị trực quan nếu có
        };
      }
      acc[title].quantity += qty;
      acc[title].revenue += qty * price;
    });
    return acc;
  }, {});

  // Chuyển object thành mảng và sắp xếp theo số lượng bán giảm dần (Món bán nhiều nhất lên đầu)
  const sortedProductSales = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);
  
  // --- LOGIC PHÂN TRANG TRÊN MẢNG ĐÃ LỌC ---
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const indexOfLastOrder = currentPage * pageSize;
  const indexOfFirstOrder = indexOfLastOrder - pageSize;
  const currentOrdersPage = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800">Thống kê Quyết toán</h1>
            <p className="text-sm text-gray-500">Chỉ hiển thị các đơn hàng đã hoàn tất (Done)</p>
          </div>
          
          {/* Bộ lọc Tab & Input Khoảng Ngày */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 w-full sm:w-auto overflow-x-auto">
              {(["day", "month", "year", "custom"] as FilterType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                    filter === t ? "bg-orange-500 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t === "day" ? "Hôm nay" : t === "month" ? "Tháng này" : t === "year" ? "Năm nay" : "Khoảng ngày"}
                </button>
              ))}
            </div>

            {/* Input chọn ngày cụ thể hiển thị khi chọn tab custom */}
            {filter === "custom" && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-200 text-xs font-semibold text-gray-600">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="outline-none bg-transparent cursor-pointer"
                />
                <span className="text-gray-400 font-normal">đến</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="outline-none bg-transparent cursor-pointer"
                />
              </div>
            )}
          </div>
        </header>

        {/* Thẻ tóm tắt doanh số */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
          <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 md:gap-5">
            <div className="p-3 md:p-4 bg-green-100 text-green-600 rounded-xl md:rounded-2xl"><HiOutlineCash size={28}/></div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Doanh thu kết quả</p>
              <p className="text-xl md:text-3xl font-black text-gray-800">{totalRevenue.toLocaleString()}đ</p>
            </div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 md:gap-5">
            <div className="p-3 md:p-4 bg-blue-100 text-blue-600 rounded-xl md:rounded-2xl"><HiOutlineCheckCircle size={28}/></div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Số đơn hoàn tất</p>
              <p className="text-xl md:text-3xl font-black text-gray-800">{filteredOrders.length} đơn</p>
            </div>
          </div>
        </div>

        {/* ================= THỐNG KÊ SẢN PHẨM ĐÃ BÁN ================= */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-5 md:p-6 border-b border-gray-50 flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><HiOutlineTrendingUp size={20} /></div>
            <h2 className="font-bold text-gray-700 text-sm md:text-base">Sản lượng bán ra theo từng loại món</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[400px]">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase pl-6">Tên sản phẩm / Loại món</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Số lượng đã bán</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right pr-6">Ước tính doanh thu món</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={3} className="p-10 text-center text-gray-400 text-sm">Đang thống kê...</td></tr>
                ) : sortedProductSales.length === 0 ? (
                  <tr><td colSpan={3} className="p-10 text-center text-gray-400 text-sm">Chưa có sản phẩm nào được bán ra trong thời gian này.</td></tr>
                ) : (
                  sortedProductSales.map((item, index) => (
                    <tr key={item.title} className="hover:bg-gray-50/30 transition">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                          #{index + 1}
                        </span>
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                        )}
                        <span className="text-sm font-bold text-gray-800">{item.title}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100">
                          {item.quantity} ly
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6 text-sm font-bold text-gray-700">
                        {item.revenue.toLocaleString()}đ
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bảng danh sách đơn hàng chi tiết kèm Phân Trang */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 md:p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-700 text-sm md:text-base">Chi tiết giao dịch</h2>
            <div className="text-[11px] text-gray-400 font-medium italic hidden sm:block">
              * Dữ liệu được cập nhật thời gian thực
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px] md:min-w-full">
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
                  <tr><td colSpan={4} className="p-16 text-center text-gray-400 text-sm">Đang truy xuất dữ liệu...</td></tr>
                ) : currentOrdersPage.length === 0 ? (
                  <tr><td colSpan={4} className="p-16 text-center text-gray-400 text-sm">Không tìm thấy đơn hàng hoàn tất nào trong thời gian này.</td></tr>
                ) : (
                  currentOrdersPage.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-700">
                          <HiOutlineCalendar className="text-gray-300" size={16} />
                          {order.createdAt.toLocaleDateString("vi-VN")}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 ml-6 uppercase">
                          {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs md:text-sm font-bold text-gray-800">{order.customer?.name || "Khách ẩn danh"}</div>
                        <div className="text-[11px] md:text-xs text-gray-500">{order.customer?.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-[240px] md:max-w-[400px]">
                          {order.items?.map((item: any, idx: number) => (
                            <span key={idx} className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md mr-1 mb-1 inline-block font-medium">
                              {item.quantity}x {item.title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="text-xs md:text-sm font-black text-orange-600">
                          {Number(order.totalAmount).toLocaleString()}đ
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Thanh phân trang */}
          {filteredOrders.length > 0 && (
            <div className="p-4 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">
                Đang xem dòng {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} trong tổng số {filteredOrders.length} hóa đơn
              </span>
              
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-1.5 border rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm text-gray-600"
                >
                  <HiChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  // Chỉ hiển thị giới hạn các nút trang nếu số lượng trang quá nhiều để tránh vỡ giao diện
                  if (totalPages > 5 && Math.abs(currentPage - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                    return null; 
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg border text-xs font-bold transition shadow-sm ${
                        currentPage === pageNum
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-1.5 border rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm text-gray-600"
                >
                  <HiChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}