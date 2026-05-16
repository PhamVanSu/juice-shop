import { getProductByType } from "../api/productState";

export default async function Products() {
  const {singleProducts, mixProducts, otherProducts} = await getProductByType();
  
  return (
    <div className="min-h-screen bg-[#f5e6d3] py-2 relative overflow-hidden">
      {/* 🌈 Ảnh trang trí xung quanh */}
      <img
        src="/images/menu/bg1.png"
        alt="orange slice"
        className="top-0 absolute h-full w-full opacity-70"
      />

      {/* HEADER */}
      <div className="text-center mb-2 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-green-500 drop-shadow-md">
          THỰC ĐƠN ĐỒ UỐNG 🍹
        </h1>
        <h2 className="text-orange-600 text-3xl mt-2 italic"><b>Nước ép nhà Su:</b> Tươi ngon và tốt cho sức khỏe mỗi ngày</h2>
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
            {singleProducts.map(({name, image, id, price, name_en}) => (
              <div key={id} className="flex items-center justify-between border-b border-dashed border-orange-300 py-2 px-5">
                <div className="flex items-center gap-3">
                  <img
                    src={image}
                    alt="peach"
                    className="w-14 h-14 rounded-full object-cover bg-whire"
                  />

                  <div>
                    <p className="text-orange-500 font-semibold leading-tight">
                      {name}
                    </p>
                    <p className="text-orange-400 text-sm">{name_en}</p>
                  </div>
                </div>

                <p className="text-orange-500 font-bold text-xl">
                  {Number(price).toLocaleString("vi-VN")}đ
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 🍹 MIX */}
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100/90 to-yellow-100/80"></div>
          <div className="relative p-6">
            <h2 className="bg-green-500 text-white px-6 py-2 rounded-full inline-block mb-4 shadow-lg">
              🍹 Mix
            </h2>
            {mixProducts.map(({name, image, id, price, name_en}) => (
              <div key={id} className="flex items-center justify-between border-b border-dashed border-orange-300 py-2 px-5">
                <div className="flex items-center gap-3">
                  <img
                    src={image}
                    alt="peach"
                    className="w-14 h-14 rounded-full object-cover"
                  />

                  <div>
                    <p className="text-green-500 font-semibold leading-tight">
                      {name}
                    </p>
                    <p className="text-green-400 text-sm">{name_en}</p>
                  </div>
                </div>

                <p className="text-green-500 font-bold text-xl">
                  {Number(price).toLocaleString("vi-VN")}đ
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🥭 SINH TỐ */}
      <div className="max-w-4xl mx-auto mt-2 px-6 relative z-10">
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/90 to-orange-100/80"></div>
          <div className="relative p-6">
            <h2 className="bg-pink-400 text-white px-6 py-2 rounded-full inline-block mb-4 shadow-lg">
              Nước ép khác
            </h2>
            {otherProducts.map(({name, image, id, price, name_en}) => (
              <div key={id} className="flex items-center justify-between border-b border-dashed border-orange-300 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={image}
                    alt="peach"
                    className="w-14 h-14 rounded-full object-cover"
                  />

                  <div>
                    <p className="text-orange-500 font-semibold leading-tight">
                      {name}
                    </p>
                    <p className="text-orange-400 text-sm">{name_en}</p>
                  </div>
                </div>

                <p className="text-orange-500 font-bold text-xl">{price}</p>
              </div>
            ))}
          </div>
        </div>
      </div> 
    </div>
  );
}
