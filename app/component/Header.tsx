"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Sản phẩm", href: "/products" },
    { name: "Liên hệ", href: "/contact" },
    { name: "Giỏ hàng", href: "/cart" },
  ];

  return (
    <header className="flex justify-between items-center px-6 md:px-12 py-4 bg-white shadow">
      <h1 className="text-xl md:text-2xl font-bold text-green-600">
        🍹 Juice Fresh
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
        className={`px-4 py-2 rounded-full font-semibold transition ${
          pathname === "/cart"
            ? "bg-green-700 text-white"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        Giỏ hàng
      </Link>
    </header>
  );
}
