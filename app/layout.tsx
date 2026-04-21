"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Đảm bảo đường dẫn này đúng với file firebase của bạn
import AdminSidebar from "./component/AdminSideBar";
import Header from "./component/Header";
import Footer from "./component/Footer";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      <html lang="en">
        <body className="flex items-center justify-center h-screen bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {isAdminPage ? (
          // LAYOUT CHO ADMIN
          isLoginPage ? (
            // Nếu là trang Login thì không hiện Sidebar
            <main>{children}</main>
          ) : user ? (
            // Chỉ hiện nội dung Admin khi đã có User
            <div className="flex min-h-screen bg-gray-100">
              <AdminSidebar />
              <div className="flex-1 ml-64">
                <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                  <span className="font-bold text-gray-700 uppercase tracking-wider">Hệ thống quản trị</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{user.email}</span>
                    <button 
                      onClick={() => auth.signOut()}
                      className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-md hover:bg-red-500 hover:text-white transition"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </header>
                <main className="p-8">{children}</main>
              </div>
            </div>
          ) : null // Tránh bị flash giao diện admin khi chưa kịp redirect
        ) : (
          // LAYOUT CHO KHÁCH HÀNG
          <div className="bg-green-50 min-h-screen">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        )}
      </body>
    </html>
  );
}