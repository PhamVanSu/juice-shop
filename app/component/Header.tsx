"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../api/useCart";
import { useState } from "react";

const navItems = [
  { name: "Trang chủ", href: "/" },
  { name: "Thực đơn", href: "/products" },
  { name: "Liên hệ", href: "/contact" },
  { name: "Giỏ hàng", href: "/cart" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cart = useCart((state) => state.cart);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-green-600">
          🍹 Nhà Su
        </h1>

        <nav className="hidden md:flex gap-6 items-center">
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

        <div className="flex items-center gap-4">
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

          {/* Nút Hamburger cho Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-gray-100 focus:outline-none transition"
            aria-label="Toggle Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu thả xuống (Dropdown) trên thiết bị di động */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3 shadow-inner">
          {navItems.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`font-semibold transition py-2 border-b border-gray-50 last:border-0 ${
                pathname === item.href
                  ? "text-green-600"
                  : "text-gray-600 hover:text-green-500"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}