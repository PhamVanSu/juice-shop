import { db } from '@/lib/firebase'
import { collection, DocumentData, getDocs, QueryDocumentSnapshot } from 'firebase/firestore'

const SINGLE = "single";
const MIX = "mix";
const SMOOTHIE = "smoothie";
const TEA = "tea";

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
}

export const getProductByType = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
  
  const allProducts: IProduct[] = querySnapshot.docs.map(
    (doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...(doc.data() as Omit<IProduct, "id">),
    })
  );
  const singleProducts = allProducts.filter((i) => i.type == SINGLE);
  const mixProducts = allProducts.filter((i) => i.type == MIX);

  return {singleProducts, mixProducts}
}
