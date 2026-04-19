import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import juiceData from "./data";

export const importJuices = async () => {
  try {
    const colRef = collection(db, "products");
    
    for (const item of juiceData) {
      await addDoc(colRef, {
        ...item,
        createdAt: serverTimestamp() // Thêm thời gian tự động
      });
      console.log(`Đã thêm: ${item.title}`);
    }
    alert("Import hoàn tất!");
  } catch (error) {
    console.error("Lỗi khi import:", error);
  }
};