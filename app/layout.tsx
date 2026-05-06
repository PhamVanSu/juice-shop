import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./clientLayout";

export const metadata: Metadata = {
  title: "Nhà Su - Nước ép tươi nguyên chất",
  description: "Khám phá các loại nước ép trái cây tươi ngon, nguyên chất và tốt cho sức khỏe tại Nhà Su. Đặt hàng ngay hôm nay!",
  keywords: "nước ép, nhà su, nước ép mix, nước ép dứa táo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/* Truyền children xuống Client Layout */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}