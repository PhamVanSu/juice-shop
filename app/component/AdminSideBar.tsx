"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineCube, HiOutlineClipboardList, HiOutlineChartBar, HiOutlineHome } from "react-icons/hi";

export default function AdminSidebar() {
  const pathname = usePathname();
  const menuItems = [
    { name: "Thống kê", href: "/admin/dashboard", icon: <HiOutlineChartBar size={20} /> },
    { name: "Sản phẩm", href: "/admin/products", icon: <HiOutlineCube size={20} /> },
    { name: "Đơn hàng", href: "/admin/orders", icon: <HiOutlineClipboardList size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col fixed h-full shadow-xl z-20">
      <div className="p-6 text-2xl font-bold text-orange-400 border-b border-slate-700">Nhà Su Admin</div>
      <nav className="flex-1 mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-3 rounded-lg transition ${pathname === item.href ? "bg-orange-500" : "hover:bg-slate-700"}`}>
            {item.icon} <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <Link href="/" className="flex items-center gap-3 p-3 text-slate-400 hover:text-white">
          <HiOutlineHome size={20} /> <span>Về Trang Chủ</span>
        </Link>
      </div>
    </aside>
  );
}