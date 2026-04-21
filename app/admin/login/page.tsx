"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Đăng nhập thành công, chuyển hướng về trang quản lý sản phẩm
      router.push("/admin/products");
    } catch (err: any) {
      setError("Email hoặc mật khẩu không chính xác!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-orange-600">Admin Nhà Su 🥤</h1>
          <p className="text-gray-500 mt-2">Vui lòng đăng nhập để quản trị hệ thống</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Quản Trị</label>
            <input
              type="email"
              required
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
              placeholder="admin@nhasu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              required
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 ${
              loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? "Đang kiểm tra..." : "Đăng Nhập Ngay 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}