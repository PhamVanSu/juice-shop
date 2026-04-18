"use client";

export default function ProductOrange() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-100 py-16 px-6">
      {/* Header */}
      <div className="text-center mb-12 animate-fadeIn">
        <h1 className="text-5xl font-extrabold text-orange-600 drop-shadow-md">
          Nước Ép Cam
        </h1>
        <p className="text-lg text-gray-700 mt-4 italic">
          Tươi ngon – giàu Vitamin C – tăng cường sức khỏe
        </p>
      </div>

      {/* Product Detail */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-white rounded-3xl shadow-xl p-10 animate-slideUp">
        {/* Image */}
        <img
          src="/images/home/orange.png"
          alt="Nước ép cam"
          className="rounded-3xl shadow-lg hover:scale-105 transition-transform duration-300"
        />

        {/* Info */}
        <div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Thông tin sản phẩm</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Nước ép cam nguyên chất được làm từ những quả cam tươi ngon, giàu Vitamin C,
            giúp tăng cường hệ miễn dịch, làm đẹp da và bổ sung năng lượng tự nhiên cho cơ thể.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            <strong>Thành phần:</strong> 100% cam tươi ép lạnh, không chất bảo quản, không đường hóa học.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            <strong>Dinh dưỡng:</strong> Vitamin C, Kali, Folate, chất chống oxy hóa.
          </p>
          <p className="text-2xl font-bold text-orange-500 mb-6">Giá: 30.000đ</p>
          <button className="bg-orange-500 text-white font-bold px-8 py-3 rounded-full shadow hover:bg-orange-600 transition transform hover:scale-105">
            Đặt hàng ngay
          </button>
          <button className="ml-3 bg-green-500 text-white font-bold px-8 py-3 rounded-full shadow hover:bg-green-600 transition transform hover:scale-105">
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-8 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
          <h3 className="text-xl font-bold text-green-500 mb-3">💪 Tăng cường miễn dịch</h3>
          <p className="text-gray-700">Giàu Vitamin C giúp cơ thể chống lại bệnh tật.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
          <h3 className="text-xl font-bold text-orange-500 mb-3">✨ Làm đẹp da</h3>
          <p className="text-gray-700">Chống oxy hóa, giúp da sáng khỏe và mịn màng.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
          <h3 className="text-xl font-bold text-pink-500 mb-3">⚡ Bổ sung năng lượng</h3>
          <p className="text-gray-700">Giúp bạn tràn đầy sức sống mỗi ngày.</p>
        </div>
      </div>

      {/* Related Products */}
      <div className="max-w-6xl mx-auto mt-20 animate-slideUp">
        <h2 className="text-3xl font-bold text-green-600 mb-8 text-center">Sản phẩm liên quan</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
            <img src="/images/home/watermelon.png" alt="Nước ép dưa hấu" className="w-24 h-24 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700">Nước ép dưa hấu</h3>
            <p className="text-orange-500 font-bold">25.000đ</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
            <img src="/images/home/pineapple.png" alt="Nước ép dứa" className="w-24 h-24 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700">Nước ép dứa</h3>
            <p className="text-orange-500 font-bold">35.000đ</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
            <img src="/images/home/apple.png" alt="Nước ép táo" className="w-24 h-24 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700">Nước ép táo</h3>
            <p className="text-orange-500 font-bold">35.000đ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
