"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, doc, deleteDoc, addDoc, updateDoc, 
  serverTimestamp, query, orderBy, where, limit, startAfter, getCountFromServer 
} from "firebase/firestore";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- State cho Phân trang & Lọc ---
  const [filterType, setFilterType] = useState("all");
  const [lastVisible, setLastVisible] = useState<any>(null); // Lưu document cuối để phân trang
  const [page, setPage] = useState(1);
  const pageSize = 5; // Số sản phẩm mỗi trang
  const [totalCount, setTotalCount] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", name: "", name_en: "", sub_title: "", 
    price: "", image: "", description: "", 
    ingredient: "", nutrition: "", type: "single" 
  });

  // 1. Lấy tổng số lượng để tính số trang
  const fetchTotalCount = async () => {
    const coll = collection(db, "products");
    const q = filterType === "all" ? coll : query(coll, where("type", "==", filterType));
    const snapshot = await getCountFromServer(q);
    setTotalCount(snapshot.data().count);
  };

  // 2. Lấy dữ liệu sản phẩm (kèm Lọc và Phân trang)
  const fetchProducts = async (isNextPage = false) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, "products"),
        // orderBy("createdAt", "desc"),
        limit(pageSize)
      );

      // Thêm điều kiện lọc nếu không phải là "all"
      if (filterType !== "all") {
        q = query(q, where("type", "==", filterType));
      }

      // Nếu là chuyển trang tiếp theo, bắt đầu sau document cuối của trang trước
      if (isNextPage && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setProducts(data);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      await fetchTotalCount();
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setPage(1);
    setLastVisible(null);
    fetchProducts();
  }, [filterType]);

  // Xử lý chuyển trang
  const handlePageChange = (next: boolean) => {
    if (next) {
      setPage(p => p + 1);
      fetchProducts(true);
    } else {
      // Firebase hỗ trợ tốt startAfter (tiến), startAt (lùi khó hơn)
      // Cách đơn giản nhất cho Admin là fetch lại từ đầu hoặc dùng library hỗ trợ
      setPage(1);
      setLastVisible(null);
      fetchProducts();
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        price: Number(formData.price), // Chuyển giá về dạng số
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), dataToSave);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await addDoc(collection(db, "products"), { 
          ...dataToSave, 
          createdAt: serverTimestamp() 
        });
        alert("Thêm sản phẩm mới thành công!");
      }
      
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu sản phẩm! Vui lòng kiểm tra console.");
    }
  };

  // 3. Xử lý Xóa
  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
      } catch (error) {
        alert("Không thể xóa sản phẩm!");
      }
    }
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      title: product.title || "",
      name: product.name || "",
      name_en: product.name_en || "",
      sub_title: product.sub_title || "",
      price: product.price?.toString() || "",
      image: product.image || "",
      description: product.description || "",
      ingredient: product.ingredient || "",
      nutrition: product.nutrition || "",
      type: product.type || "single",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ 
      title: "", name: "", name_en: "", sub_title: "", 
      price: "", image: "", description: "", 
      ingredient: "", nutrition: "", type: "single" 
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* BỘ LỌC LOẠI SẢN PHẨM */}
            <select 
              className="p-2 border rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-orange-400"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <option value="single">Single (Đơn)</option>
              <option value="mix">Mix (Hỗn hợp)</option>
            </select>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition"
            >
              + Thêm món
            </button>
          </div>
        </div>

        {/* Bảng danh sách sản phẩm */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-4">Ảnh</th>
                <th className="p-4">Tên / English</th>
                <th className="p-4">Giá</th>
                <th className="p-4">Loại</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center">Đang tải...</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-orange-50/30">
                    <td className="p-4"><img src={product.image} className="w-12 h-12 object-cover rounded-lg border" /></td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{product.title}</div>
                      <div className="text-xs text-gray-400">{product.name_en}</div>
                    </td>
                    <td className="p-4 text-green-600 font-bold">{product.price?.toLocaleString()}đ</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${product.type === 'mix' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {product.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(product)} className="text-blue-500 text-sm hover:underline">Sửa</button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-500 text-sm hover:underline">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* THANH PHÂN TRANG */}
          <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Hiển thị {products.length} / {totalCount} sản phẩm
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(false)}
                className="px-4 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-100 transition"
              >
                Trang đầu
              </button>
              <span className="px-4 py-1 font-bold text-orange-600">Trang {page}</span>
              <button 
                disabled={products.length < pageSize || loading}
                onClick={() => handlePageChange(true)}
                className="px-4 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-100 transition"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      </div>
              {/* Modal Form Thêm/Sửa */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8">
              <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-4">
                {editingId ? "📝 Cập nhật thông tin món" : "✨ Thêm món mới vào Menu"}
              </h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-bold text-gray-600">Tiêu đề (VD: Nước ép cóc)</span>
                    <input type="text" required className="admin-input text-gray-500" value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-600">Tên ngắn (VD: Cóc)</span>
                    <input type="text" className="admin-input text-gray-500" value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-600">Tên tiếng Anh (VD: Ambarella)</span>
                    <input type="text" className="admin-input text-gray-500" value={formData.name_en} 
                      onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-600">Giá bán</span>
                    <input type="number" required className="admin-input text-gray-500" value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-600">Loại sản phẩm</span>
                    <select className="admin-input text-gray-500" value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value})}>
                      <option value="single">Single (Đơn)</option>
                      <option value="mix">Mix (Hỗn hợp)</option>
                    </select>
                  </label>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-bold text-gray-600">URL Hình ảnh</span>
                    <input type="text" required className="admin-input text-gray-500" value={formData.image} 
                      onChange={(e) => setFormData({...formData, image: e.target.value})} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-600">Slogan/Tiêu đề phụ</span>
                    <input type="text" className="admin-input text-gray-500" value={formData.sub_title} 
                      onChange={(e) => setFormData({...formData, sub_title: e.target.value})} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-600">Thành phần (Ingredient)</span>
                    <input type="text" className="admin-input text-gray-500" value={formData.ingredient} 
                      onChange={(e) => setFormData({...formData, ingredient: e.target.value})} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-600">Dinh dưỡng (Nutrition)</span>
                    <input type="text" className="admin-input text-gray-500" value={formData.nutrition} 
                      onChange={(e) => setFormData({...formData, nutrition: e.target.value})} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-600">Mô tả chi tiết</span>
                    <textarea rows={2} className="admin-input text-gray-500" value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </label>
                </div>

                <div className="col-span-1 md:col-span-2 flex gap-4 mt-6 border-t pt-6">
                  <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition">Hủy bỏ</button>
                  <button type="submit" className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition">Lưu sản phẩm</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <style jsx>{`
        .admin-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          border-radius: 0.75rem;
          outline: none;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .admin-input:focus {
          border-color: #f97316;
          ring: 2px;
          ring-color: #ffedd5;
        }
      `}</style>
    </div>
  );
}