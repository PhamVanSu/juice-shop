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
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [totalCount, setTotalCount] = useState(0);

  // --- State cho Form dữ liệu ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", name: "", name_en: "", sub_title: "", 
    price: "", image: "", description: "", 
    ingredient: "", type: "single" 
  });
  
  // State riêng cho mảng Benefits
  const [benefits, setBenefits] = useState<any[]>([]);

  // 1. Lấy tổng số lượng để tính số trang
  const fetchTotalCount = async () => {
    const coll = collection(db, "products");
    const q = filterType === "all" ? coll : query(coll, where("type", "==", filterType));
    const snapshot = await getCountFromServer(q);
    setTotalCount(snapshot.data().count);
  };

  // 2. Lấy dữ liệu sản phẩm
  const fetchProducts = async (isNextPage = false) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, "products"),
        limit(pageSize)
      );

      if (filterType !== "all") {
        q = query(q, where("type", "==", filterType));
      }

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

  useEffect(() => {
    setPage(1);
    setLastVisible(null);
    fetchProducts();
  }, [filterType]);

  const handlePageChange = (next: boolean) => {
    if (next) {
      setPage(p => p + 1);
      fetchProducts(true);
    } else {
      setPage(1);
      setLastVisible(null);
      fetchProducts();
    }
  };

  // --- Xử lý Thêm/Sửa Benefits ---
  const addBenefitField = () => {
    setBenefits([...benefits, { icon: "✨", title: "", content: "", color: "text-green-500" }]);
  };

  const updateBenefit = (index: number, field: string, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index][field] = value;
    setBenefits(newBenefits);
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        benefits: benefits, // Lưu mảng benefits mới
        price: Number(formData.price),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), dataToSave);
        alert("Cập nhật thành công!");
      } else {
        await addDoc(collection(db, "products"), { 
          ...dataToSave, 
          createdAt: serverTimestamp() 
        });
        alert("Thêm mới thành công!");
      }
      
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu dữ liệu!");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa sản phẩm này?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
      } catch (error) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setBenefits(product.benefits || []);
    setFormData({
      title: product.title || "",
      name: product.name || "",
      name_en: product.name_en || "",
      sub_title: product.sub_title || "",
      price: product.price?.toString() || "",
      image: product.image || "",
      description: product.description || "",
      ingredient: product.ingredient || "",
      type: product.type || "single",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setBenefits([]);
    setFormData({ 
      title: "", name: "", name_en: "", sub_title: "", 
      price: "", image: "", description: "", 
      ingredient: "", type: "single" 
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <div className="flex items-center gap-4">
            <select 
              className="p-2 border rounded-lg bg-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <option value="single">Single</option>
              <option value="mix">Mix</option>
            </select>
            <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition">
              + Thêm món
            </button>
          </div>
        </div>

        {/* Bảng danh sách */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-4">Ảnh</th>
                <th className="p-4">Tên sản phẩm</th>
                <th className="p-4">Giá</th>
                <th className="p-4">Loại</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center">Đang tải...</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-orange-50/30">
                    <td className="p-4"><img src={product.image} className="w-12 h-12 object-cover rounded-lg border" alt="" /></td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{product.title}</div>
                      <div className="text-xs text-gray-400">{product.name_en}</div>
                    </td>
                    <td className="p-4 text-green-600 font-bold">{product.price?.toLocaleString()}đ</td>
                    <td className="p-4"><span className="text-xs font-bold uppercase">{product.type}</span></td>
                    <td className="p-4">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => openEdit(product)} className="text-blue-500 hover:font-bold">Sửa</button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:font-bold">Xóa</button>
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

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl my-auto">
              <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-4">
                {editingId ? "📝 Chỉnh sửa món" : "✨ Thêm món mới"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cột trái: Thông tin cơ bản */}
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-600">Tiêu đề sản phẩm
                      <input type="text" required className="admin-input" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block text-sm font-bold text-gray-600">Tên ngắn
                        <input type="text" className="admin-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                      </label>
                      <label className="block text-sm font-bold text-gray-600">Tiếng Anh
                        <input type="text" className="admin-input" value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block text-sm font-bold text-gray-600">Giá bán (VNĐ)
                        <input type="number" required className="admin-input" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                      </label>
                      <label className="block text-sm font-bold text-gray-600">Loại
                        <select className="admin-input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                          <option value="single">Single</option>
                          <option value="mix">Mix</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* Cột phải: Hình ảnh & Mô tả */}
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-600">Link hình ảnh
                      <input type="text" required className="admin-input" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                    </label>
                    <label className="block text-sm font-bold text-gray-600">Tiêu đề phụ
                      <input type="text" className="admin-input" value={formData.sub_title} onChange={(e) => setFormData({...formData, sub_title: e.target.value})} />
                    </label>
                    <label className="block text-sm font-bold text-gray-600">Mô tả tóm tắt
                      <textarea rows={2} className="admin-input" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </label>
                  </div>
                </div>

                {/* PHẦN QUẢN LÝ BENEFITS (Thay thế Nutrition) */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black text-orange-600 uppercase tracking-wider">🌟 Lợi ích sức khỏe (Benefits)</h3>
                    <button type="button" onClick={addBenefitField} className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold hover:bg-orange-200">
                      + Thêm thẻ lợi ích
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {Array.isArray(benefits) && benefits.map((b, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 bg-white p-3 rounded-xl shadow-sm border text-gray-700">
                        <input className="col-span-1 text-center border rounded-lg p-2" placeholder="Icon" value={b.icon} onChange={(e) => updateBenefit(idx, 'icon', e.target.value)} />
                        <input className="col-span-3 border rounded-lg p-2 font-bold" placeholder="Tiêu đề" value={b.title} onChange={(e) => updateBenefit(idx, 'title', e.target.value)} />
                        <input className="col-span-5 border rounded-lg p-2 text-sm" placeholder="Nội dung chi tiết..." value={b.content} onChange={(e) => updateBenefit(idx, 'content', e.target.value)} />
                        <input className="col-span-2 h-10 w-full rounded-lg cursor-pointer" value={b.color} onChange={(e) => updateBenefit(idx, 'color', e.target.value)} />
                        <button type="button" onClick={() => removeBenefit(idx)} className="col-span-1 text-red-400 hover:text-red-600 font-bold">✕</button>
                      </div>
                    ))}
                    {benefits.length === 0 && <p className="text-center text-gray-400 text-xs py-4 italic">Chưa có lợi ích nào được thêm.</p>}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-500">Hủy</button>
                  <button type="submit" className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg">Lưu thông tin</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .admin-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          padding: 0.6rem 0.8rem;
          border-radius: 0.75rem;
          outline: none;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          background: white;
        }
        .admin-input:focus { border-color: #f97316; }
      `}</style>
    </div>
  );
}