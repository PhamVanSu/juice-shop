"use client";

import Image from "next/image";

export default function AboutContact() {
  return (
    <main className="bg-gradient-to-b from-green-50 to-green-100 text-gray-800">
      {/* About */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-green-700 mb-6 leading-tight">
            Nước ép nhà Su
          </h2>
          <p className="text-lg text-gray-600 mb-4 italic">
            Tươi ngon mỗi ngày – chăm sóc sức khỏe từ thiên nhiên
          </p>
          <p className="text-gray-600 leading-relaxed">
            Chúng tôi cung cấp các loại nước ép hoa quả tươi, sạch và giàu dinh dưỡng.
            Nguyên liệu được chọn lọc kỹ lưỡng, đảm bảo mỗi sản phẩm đến tay khách hàng
            đều giữ trọn hương vị tự nhiên và giá trị dinh dưỡng cao nhất.
          </p>
        </div>

        <div className="relative w-full h-[350px]">
          <Image
            src="/images/menu/1.png"
            alt="Juice Bar"
            fill
            className="object-cover rounded-3xl shadow-xl"
          />
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Sứ mệnh",
            color: "text-orange-500",
            desc: "Mang đến nước ép sạch, không chất bảo quản, giúp nâng cao sức khỏe cộng đồng.",
          },
          {
            title: "Giá trị",
            color: "text-green-600",
            desc: "Nguyên liệu tươi, sáng tạo sản phẩm, dịch vụ tận tâm.",
          },
          {
            title: "Tầm nhìn",
            color: "text-pink-500",
            desc: "Trở thành thương hiệu nước ép được yêu thích và tin dùng hàng đầu.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="group bg-white/70 backdrop-blur rounded-2xl p-8 shadow-md hover:shadow-xl transition"
          >
            <h3 className={`text-xl font-semibold mb-3 ${item.color}`}>
              {item.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Contact */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-3xl shadow-xl p-10 md:p-14 border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-10 text-center">
            Liên hệ với chúng tôi
          </h2>

          <div className="grid md:grid-cols-2 gap-10 text-gray-600">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-400">Facebook</p>
                <p className="font-medium">
                  <a
                    href="https://www.facebook.com/nguyen.phuong.thao.280426"
                    className="font-medium text-blue-600 hover:underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Nguyễn Phương Thảo
                  </a>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Hotline</p>
                <p className="font-medium">0332 580 575</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-400">Địa chỉ</p>
                <p className="font-medium">Bình Yên, Thạch Thất, Hà Nội</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Giờ mở cửa</p>
                <p className="font-medium">08:00 - 22:00 (Hàng ngày)</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}