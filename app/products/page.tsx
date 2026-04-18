"use client";

export default function Products() {
  return (
    <div className="min-h-screen bg-[#f5e6d3] py-10 relative overflow-hidden">
      {/* 🌈 Ảnh trang trí xung quanh */}
      <img
        src="/images/menu/bg1.png"
        alt="orange slice"
        className="top-0 absolute h-full w-full opacity-70"
      />

      {/* HEADER */}
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-orange-500 drop-shadow-md">
          THỰC ĐƠN ĐỒ UỐNG 🍹
        </h1>
        <p className="text-gray-600 mt-2 text-lg italic"><b>Nước ép nhà Su:</b> Tươi ngon và tốt cho sức khỏe mỗi ngày</p>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 relative z-10">
        {/* 🍊 NƯỚC ÉP */}
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/90 to-yellow-100/80"></div>
          <div className="relative p-6">
            <h2 className="bg-orange-400 text-white px-6 py-2 rounded-full inline-block mb-4 shadow-lg">
              🍊 Nước ép
            </h2>
            <ul className="space-y-3 text-2xl">
              <li className="flex justify-between"><span className="text-rose-600">Cam</span><span className="font-bold">15k</span></li>
              <li className="flex justify-between"><span className="text-rose-500">Ổi</span><span className="font-bold">20k</span></li>
              <li className="flex justify-between"><span className="text-rose-500">Táo</span><span className="font-bold">17k</span></li>
              <li className="flex justify-between"><span className="text-rose-500">Thơm</span><span className="font-bold">15k</span></li>
              <li className="flex justify-between"><span className="text-rose-500">Nho</span><span className="font-bold">18k</span></li>
              <li className="flex justify-between"><span className="text-rose-500">Dưa hấu</span><span className="font-bold">18k</span></li>
            </ul>
          </div>
        </div>

        {/* 🍹 MIX */}
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100/90 to-yellow-100/80"></div>
          <div className="relative p-6">
            <h2 className="bg-green-500 text-white px-6 py-2 rounded-full inline-block mb-4 shadow-lg">
              🍹 Mix
            </h2>
            <ul className="space-y-3 text-2xl">
              <li className="flex justify-between"><span>Táo + Cần tây</span><span className="font-bold">20k</span></li>
              <li className="flex justify-between"><span>Cà rốt + Táo</span><span className="font-bold">25k</span></li>
              <li className="flex justify-between"><span>Dưa hấu + Táo</span><span className="font-bold">30k</span></li>
              <li className="flex justify-between"><span>Cam + Thơm</span><span className="font-bold">25k</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 🥭 SINH TỐ */}
      <div className="max-w-4xl mx-auto mt-16 px-6 relative z-10">
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/90 to-orange-100/80"></div>
          <div className="relative p-6">
            <h2 className="bg-pink-400 text-white px-6 py-2 rounded-full inline-block mb-4 shadow-lg">
              🥭 Sinh tố
            </h2>
            <ul className="space-y-3 text-2xl">
              <li className="flex justify-between"><span className="text-rose-500">Bơ</span><span className="font-bold text-orange-500">20k</span></li>
              <li className="flex justify-between"><span>Sầu riêng</span><span className="font-bold">25k</span></li>
              <li className="flex justify-between"><span>Dâu</span><span className="font-bold">20k</span></li>
              <li className="flex justify-between"><span>Mít</span><span className="font-bold">23k</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
