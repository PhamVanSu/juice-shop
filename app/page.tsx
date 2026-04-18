"use client";

import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Nước ép cam",
    price: "30.000đ",
    image: "/images/home/orange.png",
  },
  {
    id: 2,
    name: "Nước ép dưa hấu",
    price: "25.000đ",
    image: "/images/home/watermelon.png",
  },
  {
    id: 3,
    name: "Nước ép dứa",
    price: "35.000đ",
    image: "/images/home/pineapple.png",
  },
    {
    id: 4,
    name: "Nước ép cóc",
    price: "30.000đ",
    image: "/images/home/pog-plum.png",
  },
  {
    id: 5,
    name: "Nước ép ổi",
    price: "25.000đ",
    image: "/images/home/guava.png",
  },
  {
    id: 6,
    name: "Nước ép táo",
    price: "35.000đ",
    image: "/images/home/apple.png",
  },
    {
    id: 7,
    name: "Nước ép cà rốt",
    price: "30.000đ",
    image: "/images/home/carrot.png",
  },
];

const mix = [
  {
    id: 1,
    name: "Nước ép cam dứa",
    price: "30.000đ",
    image: "/images/home/orange-pineapple.png",
  },
  {
    id: 2,
    name: "Nước ép cam cà rốt",
    price: "25.000đ",
    image: "/images/home/orange-carrot.png",
  },
  {
    id: 3,
    name: "Nước ép cóc ổi",
    price: "35.000đ",
    image: "/images/home/hog-plum-guava.png",
  },
    {
    id: 4,
    name: "Nước ép dứa cà rốt",
    price: "30.000đ",
    image: "/images/home/pineapple-carrot.png",
  },
  {
    id: 5,
    name: "Nước ép cóc táo",
    price: "25.000đ",
    image: "/images/home/hog-plum-apple.png",
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="flex flex-col-reverse md:flex-row items-center px-6 md:px-16 py-12 md:py-20 gap-10">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-bold text-green-700">
            Nước ép nhà Su <br/>Trái cây tươi mỗi ngày🍊
          </h2>
          <p className="mt-4 text-gray-600">
            100% trái cây tự nhiên - Tốt cho sức khỏe
          </p>

          <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700">
            Mua ngay
          </button>
        </div>

        <img
          src="/images/home/fruit.png"
          className="w-full md:w-1/2 rounded-xl shadow"
        />
      </section>

      {/* PRODUCTS */}
      <section className="px-6 md:px-16 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-8">
          Nước ép trái cây
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`}>
              <div className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition p-4">
                <img
                  src={p.image}
                  className="rounded-lg h-96 w-full object-cover"
                  alt={p.name}
                />
                <h3 className="mt-3 font-semibold text-lg">{p.name}</h3>
                <p className="text-green-600 font-bold">{p.price}</p>

                <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Thêm vào giỏ
                </button>
              </div>
            </Link>
          ))}
        </div>
        <br/>
        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-8">
          Nước ép mix
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mix.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
            >
              <img
                src={p.image}
                className="rounded-lg h-96 w-full object-cover"
              />
              <h3 className="mt-3 font-semibold text-lg">{p.name}</h3>
              <p className="text-green-600 font-bold">{p.price}</p>

              <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* BANNER */}
      <section className="bg-orange-400 text-white text-center py-10 px-6">
        <h2 className="text-2xl md:text-3xl font-bold">
          🎉 Giảm 20% cho đơn hàng đầu tiên!
        </h2>
        <p className="mt-2">Nhanh tay đặt hàng ngay hôm nay</p>
      </section>
    </>
  );
}