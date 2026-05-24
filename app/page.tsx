export const revalidate = 0;

import ProductItem from "./component/ProductItem";
import { getProductByType } from './api/productState';

export default async function Home() {
  const {singleProducts, mixProducts, smoothieProducts, otherProducts} = await getProductByType();

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
          src="/images/products/fruit.png"
          className="w-full md:w-1/2 rounded-xl shadow"
        />
      </section>

      {/* PRODUCTS */}
      <section className="px-6 md:px-16 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-8">
          Nước ép trái cây
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {singleProducts.map(({id, image, title, price, size}) => (
            <ProductItem key={id} id={id} image={image} title={title} price={price} size={size}/>
          ))}
        </div>
        <br/>
        
        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-8">
          Nước ép mix
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mixProducts.map(({id, image, title, price, size}) => (
            <ProductItem key={id} id={id} image={image} title={title} price={price} size={size}/>
          ))}
        </div>
        <br/>

        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-8">
          Sinh tố
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {smoothieProducts.map(({id, image, title, price, size}) => (
            <ProductItem key={id} id={id} image={image} title={title} price={price} size={size}/>
          ))}
        </div>
        <br/>

        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-8">
          Nước uống khác
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {otherProducts.map(({id, image, title, price, size}) => (
            <ProductItem key={id} id={id} image={image} title={title} price={price} size={size}/>
          ))}
        </div>
      </section>

      {/* BANNER */}
      {/* <section className="bg-orange-400 text-white text-center py-10 px-6">
        <h2 className="text-2xl md:text-3xl font-bold">
          🎉 Giảm ngay 15% cho các đơn hàng ngày khai trương 18/05/2026!
        </h2>
        <p className="mt-2">Nhanh tay đặt hàng ngay để nhận được ưu đãi</p>
      </section> */}
    </>
  );
}