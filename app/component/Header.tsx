"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../api/useCart";

  const navItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Thực đơn", href: "/products" },
    { name: "Liên hệ", href: "/contact" },
    { name: "Giỏ hàng", href: "/cart" },
  ];

export default function Header() {
  const pathname = usePathname();

  const cart = useCart((state) => state.cart);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="flex justify-between items-center px-6 md:px-12 py-4 bg-white shadow">
      <h1 className="text-xl md:text-2xl font-bold text-green-600">
        🍹 Nhà Su
      </h1>

      <nav className="hidden md:flex gap-6">
        {navItems.slice(0, 3).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`font-semibold transition ${
              pathname === item.href
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600 hover:text-green-500"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <Link
        href="/cart"
        className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-sm
          ${
            pathname === "/cart"
              ? "bg-green-700 text-white shadow-md scale-105"
              : "bg-green-600 text-white hover:bg-green-700 hover:scale-105"
          }`}
      >
        <span className="text-lg">🛒</span>
        <span>Giỏ hàng</span>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-md">
            {totalItems}
          </span>
        )}
      </Link>
    </header>
  );
}
