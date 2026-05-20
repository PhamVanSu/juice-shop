"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, updateDoc, onSnapshot, getDocs } from "firebase/firestore";
import { HiOutlineClock, HiOutlinePlay, HiOutlineCheck, HiOutlineUser, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineBeaker, HiOutlineClipboardList } from "react-icons/hi";

// Đảm bảo Vercel luôn lấy dữ liệu Realtime, không lưu cache tĩnh lúc Build
export const dynamic = "force-dynamic";

const STATUS_CONFIG: { [key: string]: { label: string; color: string; nextStatus: string | null; btnText: string; btnColor: string; icon: any } } = {
  pending: {
    label: "Chờ xử lý",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    nextStatus: "processing",
    btnText: "Bắt đầu làm",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
    icon: HiOutlineClock,
  },
  processing: {
    label: "Đang làm",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    nextStatus: "done",
    btnText: "Hoàn tất món",
    btnColor: "bg-green-600 hover:bg-green-700 text-white",
    icon: HiOutlinePlay,
  },
};

// Chuẩn hóa Key về chữ thường để tránh lỗi lệch chữ hoa/chữ thường từ Database
const FRUIT: { [key: string]: string } = {
  ambarella: "Cóc",
  carrot: "Cà rốt",
  watermelon: "Dưa hấu",
  guava: "Ổi",
  orange: "Cam",
  pineapple: "Dứa",
  apple: "Táo",
  lemon: "Chanh"
};

export default function KitchenOrders() {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [productRecipes, setProductRecipes] = useState<{ [productId: string]: any }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Tải trước toàn bộ cấu hình định lượng (recipe) map theo Product ID từ "products"
    const fetchRecipes = async () => {
      try {
        const productSnapshot = await getDocs(collection(db, "products"));
        const recipesMap: { [productId: string]: any } = {};
        
        productSnapshot.docs.forEach((docDoc) => {
          const pData = docDoc.data();
          const productId = docDoc.id;
          
          if (pData.recipe) {
            recipesMap[productId] = pData.recipe;
          }
        });
        setProductRecipes(recipesMap);
      } catch (error) {
        console.error("Lỗi đồng bộ cấu hình sản phẩm:", error);
      }
    };

    fetchRecipes();

    // 2. Lắng nghe thời gian thực đơn hàng "orders"
    const ordersRef = collection(db, "orders");
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      try {
        const data: any[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        const filtered = data.filter(
          (order) => order.status === "pending" || order.status === "processing"
        );

        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        setActiveOrders(filtered);
      } catch (error) {
        console.error("Lỗi xử lý dữ liệu đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ================= LOGIC TỔNG HỢP SẢN PHẨM & NGUYÊN LIỆU DỰA TRÊN PRODUCT ID =================
  const summaryProducts: { [title: string]: number } = {};
  const summaryIngredients: { [ingredient: string]: number } = {};

  activeOrders.forEach((order) => {
    order.items?.forEach((item: any) => {
      const pId = item.productId || item.id;
      const displayTitle = item.title?.trim() || "Món không tên";
      const qty = Number(item.quantity) || 0;

      // 1. Gom tổng số lượng cốc hiển thị
      summaryProducts[displayTitle] = (summaryProducts[displayTitle] || 0) + qty;

      // 2. Tra cứu công thức bằng ID sản phẩm kết nối trực tiếp sang bảng products
      if (pId) {
        const liveRecipe = productRecipes[pId];

        if (liveRecipe && Object.keys(liveRecipe).length > 0) {
          Object.keys(liveRecipe).forEach((ing) => {
            const mlPerCup = Number(liveRecipe[ing]) || 0;
            summaryIngredients[ing] = (summaryIngredients[ing] || 0) + mlPerCup * qty;
          });
        } else {
          summaryIngredients["Sữa chua đánh đá"] = (summaryIngredients["Sữa chua đánh đá"] || 0) + qty;
        }
      } else {
        summaryIngredients["Đơn lỗi (Thiếu Product ID)"] = (summaryIngredients["Đơn lỗi (Thiếu Product ID)"] || 0) + qty;
      }
    });
  });

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const config = STATUS_CONFIG[currentStatus];
    if (!config || !config.nextStatus) return;

    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: config.nextStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Không thể chuyển trạng thái đơn hàng. Vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Tiêu đề trang */}
        <header className="mb-8 flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
              📋 Điều Phối Pha Chế <span className="text-orange-500">Nhà Su</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Danh sách đơn hàng cần làm ngay (Tự động cập nhật thời gian thực)
            </p>
          </div>
          <div className="bg-orange-500 text-white font-bold px-4 py-2 rounded-full text-sm shadow-sm animate-pulse">
            {activeOrders.length} Đơn đang đợi
          </div>
        </header>

        {/* ================= BẢNG TỔNG HỢP NGUYÊN LIỆU VÀ SẢN PHẨM CẦN LÀM NGAY ================= */}
        {!loading && activeOrders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Cột 1: Thống kê số lượng ml hoa quả cần ép */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 text-orange-600 font-bold mb-4 text-base border-b pb-2">
                <HiOutlineBeaker size={22} />
                <h3>Tổng lượng cốt hoa quả cần ép (ID Matching)</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(summaryIngredients).map((ing) => {
                  // Xử lý dịch tên: Chuyển ing về chữ thường để map vào bộ từ điển FRUIT
                  const normalizedIng = ing.toLowerCase();
                  const fruitNameVi = FRUIT[normalizedIng] || ing;

                  return (
                    <div key={ing} className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700">{fruitNameVi}</span>
                      <span className="text-base font-black text-orange-600">
                        {ing.includes("Sữa chua đánh đá") || ing.includes("Thiếu Product ID")
                          ? `${summaryIngredients[ing]} cốc`
                          : summaryIngredients[ing] >= 1000 
                            ? `${(summaryIngredients[ing] / 1000).toFixed(1)} Lít` 
                            : `${summaryIngredients[ing]} ml`
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cột 2: Thống kê tổng số lượng cốc */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-4 text-base border-b pb-2">
                <HiOutlineClipboardList size={22} />
                <h3>Tổng số cốc cần chuẩn bị</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(summaryProducts).map((title) => (
                  <div key={title} className="bg-blue-50/30 p-3 rounded-2xl border border-blue-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700 truncate mr-2" title={title}>{title}</span>
                    <span className="text-sm font-black bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {summaryProducts[title]} cốc
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-sm font-medium">Đang đồng bộ dữ liệu quầy bar...</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center text-gray-400 max-w-md mx-auto mt-10 shadow-sm">
            <span className="text-5xl mb-4 block">🎉</span>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Hết đơn hàng đợi!</h3>
            <p className="text-xs text-gray-400">Hiện tại quầy pha chế đã hoàn thành xong toàn bộ các đơn hàng.</p>
          </div>
        ) : (
          /* Danh sách lưới các đơn hàng chi tiết */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeOrders.map((order) => {
              const statusInfo = STATUS_CONFIG[order.status];
              const StatusIcon = statusInfo?.icon;

              return (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-3xl border shadow-sm flex flex-col justify-between overflow-hidden transition-all hover:shadow-md ${
                    order.status === "processing" ? "border-blue-300 ring-2 ring-blue-50" : "border-gray-100"
                  }`}
                >
                  <div className="p-5 md:p-6">
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="text-left">
                        <span className="text-xs font-mono font-bold text-gray-400 block uppercase">MÃ ĐƠN HÀNG</span>
                        <h2 className="text-base font-black text-gray-800 font-mono tracking-wider">{order.orderCode || order.id.slice(0, 8)}</h2>
                      </div>
                      {statusInfo && (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                          {StatusIcon && <StatusIcon size={14} />}
                          {statusInfo.label}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 border-b pb-4 mb-4 text-xs text-gray-600 font-medium">
                      <div className="flex items-center gap-2">
                        <HiOutlineUser className="text-gray-400" size={14} />
                        <span className="text-gray-800 font-bold">{order.customer?.name}</span>
                        {order.customer?.phone && (
                          <span className="text-gray-400 flex items-center gap-0.5 ml-2">
                            <HiOutlinePhone size={12} /> {order.customer.phone}
                          </span>
                        )}
                      </div>
                      {order.customer?.address && (
                        <div className="flex items-start gap-2 text-gray-500">
                          <HiOutlineLocationMarker className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
                          <p className="line-clamp-1">{order.customer.address}</p>
                        </div>
                      )}
                      <div className="text-[11px] text-gray-400 pt-1 italic font-normal">
                        Đặt lúc: {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({order.createdAt.toLocaleDateString("vi-VN")})
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🍹 Món nước cần làm:</h4>
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                          <div className="text-left">
                            <div className="text-sm font-bold text-gray-800">
                              {item.title} <span className="text-orange-500 font-black ml-1">x{item.quantity}</span>
                            </div>
                            {item.comment && (
                              <p className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded mt-1.5 inline-block">
                                📌 {item.comment}
                              </p>
                            )}
                          </div>
                          <div className="text-xs font-black text-gray-500">
                            {(Number(item.price) * item.quantity).toLocaleString()}đ
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Tổng thu</span>
                      <span className="text-base font-black text-green-600">{Number(order.totalAmount).toLocaleString()}đ</span>
                    </div>

                    {statusInfo?.nextStatus && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, order.status)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 ${statusInfo.btnColor}`}
                      >
                        {order.status === "pending" ? <HiOutlinePlay size={15} /> : <HiOutlineCheck size={15} />}
                        {statusInfo.btnText}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}