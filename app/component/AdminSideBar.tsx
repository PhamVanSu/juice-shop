"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineCube, HiOutlineClipboardList, HiOutlineChartBar, HiOutlineHome, HiX } from "react-icons/hi";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const menuItems = [
    { name: "Thống kê", href: "/admin/dashboard", icon: <HiOutlineChartBar size={20} /> },
    { name: "Sản phẩm", href: "/admin/products", icon: <HiOutlineCube size={20} /> },
    { name: "Đơn hàng", href: "/admin/orders", icon: <HiOutlineClipboardList size={20} /> },
    { name: "Điều phối đơn hàng", href: "/admin/kitchenOrders", icon: <HiOutlineClipboardList size={20} /> },
  ];

  return (
    <>
      {/* Lớp nền mờ (Overlay) che màn hình khi mở Sidebar trên điện thoại. Click vào nền tự đóng. */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Thanh Sidebar chính */}
      <aside className={`
        w-64 bg-slate-800 text-white flex flex-col fixed h-full shadow-xl z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}>
        {/* Header Sidebar */}
        <div className="p-6 text-2xl font-bold text-orange-400 border-b border-slate-700 flex items-center justify-between">
          <span>Nhà Su Admin</span>
          {/* Nút chữ X để đóng nhanh Sidebar - Chỉ hiện trên điện thoại */}
          <button 
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded transition"
          >
            <HiX size={24} />
          </button>
        </div>

        {/* Nội dung các đường link điều hướng */}
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={onClose} // Tự động đóng sidebar sau khi click chọn link di chuyển trang trên điện thoại
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === item.href 
                  ? "bg-orange-500 text-white" 
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {item.icon} <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Nút quay về trang chủ ở dưới cùng */}
        <div className="p-4 border-t border-slate-700">
          <Link 
            href="/" 
            className="flex items-center gap-3 p-3 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition"
          >
            <HiOutlineHome size={20} /> <span>Về Trang Chủ</span>
          </Link>
        </div>
      </aside>
    </>
  );
}