import { db } from '@/lib/firebase'
import { collection, DocumentData, getDocs, QueryDocumentSnapshot, query, where } from 'firebase/firestore'

const SINGLE = "single";
const MIX = "mix";
const SMOOTHIE = "smoothie";
const TEA = "tea";
const OTHER = "other";

export interface IProduct {
  id: string; 
  title: string;
  sub_title: string;
  name: string;
  name_en: string;
  description: string;
  ingredient: string;
  nutrition: string;
  price: string | number; 
  image: string;
  type: string;
  isVisible?: boolean; // Thêm trường này vào interface nếu chưa có
}

export const getProductByType = async () => {
  // Tạo truy vấn chỉ lấy các sản phẩm có isVisible == true
  const q = query(
    collection(db, "products"), 
    where("isVisible", "==", true)
  );
  
  // Thực hiện lấy dữ liệu dựa trên truy vấn q thay vì lấy cả collection
  const querySnapshot = await getDocs(q);
  
  const activeProducts: IProduct[] = querySnapshot.docs.map(
    (doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...(doc.data() as Omit<IProduct, "id">),
    })
  );

  // Phân loại dựa trên danh sách sản phẩm đang hoạt động (hiển thị)
  const singleProducts = activeProducts.filter((i) => i.type === SINGLE);
  const mixProducts = activeProducts.filter((i) => i.type === MIX);
  const otherProducts = activeProducts.filter((i) => i.type === OTHER);

  return { singleProducts, mixProducts, otherProducts };
}