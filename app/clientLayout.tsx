"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Đảm bảo đường dẫn này đúng với file firebase của bạn
import AdminSidebar from "./component/AdminSideBar";
import Header from "./component/Header";
import Footer from "./component/Footer";
import { HiMenuAlt2 } from "react-icons/hi"; // Icon hamburger để mở menu trên mobile

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State quản lý đóng/mở sidebar trên mobile

  // Kiểm tra xem trang hiện tại có phải là trang admin không
  const isAdminPage = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Lắng nghe trạng thái đăng nhập của Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Nếu đang vào trang Admin (không phải trang login) mà chưa đăng nhập
      if (isAdminPage && !isLoginPage && !currentUser) {
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [isAdminPage, isLoginPage, router]);

  // Hiển thị màn hình loading tạm thời khi đang kiểm tra quyền truy cập admin
  if (loading && isAdminPage && !isLoginPage) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      {isAdminPage ? (
        // LAYOUT CHO ADMIN
        isLoginPage ? (
          // Nếu là trang Login thì không hiện Sidebar
          <main>{children}</main>
        ) : user ? (
          // Chỉ hiện nội dung Admin khi đã có User
          <div className="flex min-h-screen bg-gray-100 w-full relative">
            {/* Truyền state và hàm đóng xuống Sidebar */}
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            {/* Trên mobile thì chiếm full màn hình, trên desktop (md:) thụt lề vào ml-64 */}
            <div className="flex-1 md:ml-64 min-w-0 flex flex-col">
              <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                  {/* Nút Hamburger - Chỉ hiển thị trên thiết bị di động (< md) */}
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600 transition"
                  >
                    <HiMenuAlt2 size={24} />
                  </button>
                  <span className="font-bold text-gray-700 uppercase tracking-wider text-sm md:text-base truncate">
                    Admin
                  </span>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <span className="text-xs md:text-sm text-gray-500 max-w-[140px] md:max-w-none truncate">
                    {user.email}
                  </span>
                  <button 
                    onClick={() => auth.signOut()}
                    className="text-xs bg-red-50 text-red-500 px-2.5 py-1.5 md:px-3 md:py-1 rounded-md hover:bg-red-500 hover:text-white transition whitespace-nowrap"
                  >
                    Đăng xuất
                  </button>
                </div>
              </header>

              {/* Padding nhỏ hơn trên mobile (p-4) giúp nội dung bảng biểu, danh sách không bị ép quá hẹp */}
              <main className="p-4 md:p-8 flex-1">{children}</main>
            </div>
          </div>
        ) : null // Tránh bị flash giao diện admin khi chưa kịp redirect
      ) : (
        // LAYOUT CHO KHÁCH HÀNG
        <div className="bg-green-50 min-h-screen flex flex-col flex-1">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      )}
    </>
  );
}