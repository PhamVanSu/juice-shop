"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, doc, deleteDoc, addDoc, updateDoc, 
  serverTimestamp, query, orderBy, where, limit, startAfter, getCountFromServer 
} from "firebase/firestore";
import { HiOutlineBeaker, HiOutlineTrash, HiOutlinePlusCircle } from "react-icons/hi";

// Định nghĩa kiểu dữ liệu cho định lượng nguyên liệu
interface IngredientConfig {
  name: string;
  ml: number;
}

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
    type: "single", isVisible: true 
  });
  
  const [benefits, setBenefits] = useState<any[]>([]);
  
  // --- STATE MỚI: Quản lý định lượng hoa quả cần ép (ml) ---
  const [ingredients, setIngredients] = useState<IngredientConfig[]>([]);

  const fetchTotalCount = async () => {
    const coll = collection(db, "products");
    const q = filterType === "all" ? coll : query(coll, where("type", "==", filterType));
    const snapshot = await getCountFromServer(q);
    setTotalCount(snapshot.data().count);
  };

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

  // --- LOGIC ĐIỀU CHỈNH ĐỊNH LƯỢNG NGUYÊN LIỆU (Mới) ---
  const addIngredientField = () => {
    setIngredients([...ingredients, { name: "", ml: 300 }]);
  };

  const updateIngredient = (index: number, field: keyof IngredientConfig, value: any) => {
    const newIngredients = [...ingredients];
    if (field === "ml") {
      newIngredients[index][field] = Number(value) || 0;
    } else {
      newIngredients[index][field] = value;
    }
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // --- Logic cũ giữ nguyên ---
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

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "products", id), {
        isVisible: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      setProducts(products.map(p => p.id === id ? { ...p, isVisible: !currentStatus } : p));
    } catch (error) {
      console.error(error);
      alert("Lỗi khi cập nhật trạng thái hiển thị!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Chuyển mảng ingredients thành object cấu trúc phẳng { "Dứa": 300, "Táo": 300 } 
      // để khớp hoàn hảo với logic đồng bộ tính toán ở trang Kitchen quầy bar
      const recipeObject: { [key: string]: number } = {};
      ingredients.forEach((ing) => {
        if (ing.name.trim()) {
          recipeObject[ing.name.trim()] = ing.ml;
        }
      });

      const dataToSave = {
        ...formData,
        benefits: benefits,
        recipe: recipeObject, // Lưu trường này vào Firestore thay vì text thô
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
    
    // Đọc object công thức từ Firestore `recipe: { "Dứa": 300 }` 
    // và phân tách ngược lại về dạng mảng `[{ name: "Dứa", ml: 300 }]` để điền vào Form
    if (product.recipe) {
      const parsedIngredients = Object.keys(product.recipe).map((key) => ({
        name: key,
        ml: product.recipe[key],
      }));
      setIngredients(parsedIngredients);
    } else {
      setIngredients([]);
    }

    setFormData({
      title: product.title || "",
      name: product.name || "",
      name_en: product.name_en || "",
      sub_title: product.sub_title || "",
      price: product.price?.toString() || "",
      image: product.image || "",
      description: product.description || "",
      type: product.type || "single",
      isVisible: product.isVisible !== undefined ? product.isVisible : true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setBenefits([]);
    setIngredients([]);
    setFormData({ 
      title: "", name: "", name_en: "", sub_title: "", 
      price: "", image: "", description: "", 
      type: "single", isVisible: true 
    });
  };

  return (
    <div className="p-3 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Tiện ích lọc */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              className="flex-1 sm:flex-none p-2.5 border rounded-lg bg-white text-sm outline-none shadow-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <option value="single">Single</option>
              <option value="mix">Mix</option>
              <option value="smoothie">smoothie</option>
              <option value="other">Other</option>
            </select>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex-1 sm:flex-none bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-orange-600 transition text-sm text-center shadow-md"
            >
              + Thêm món
            </button>
          </div>
        </div>

        {/* ================= DANH SÁCH DẠNG THẺ (CARD VIEW) - CHỈ HIỆN TRÊN MOBILE ================= */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400 bg-white rounded-xl border">Đang tải...</div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center text-gray-400 bg-white rounded-xl border">Chưa có sản phẩm nào.</div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <img src={product.image} className="w-14 h-14 object-cover rounded-lg border bg-gray-50" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate text-base">{product.title}</div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{product.name_en || "Chưa có tên EN"}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-green-600 font-bold text-sm">{product.price?.toLocaleString()}đ</span>
                      <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">{product.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-1">
                  <button 
                    onClick={() => toggleVisibility(product.id, product.isVisible !== false)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                      product.isVisible !== false 
                        ? 'bg-green-50 border-green-200 text-green-600' 
                        : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}
                  >
                    {product.isVisible !== false ? '🟢 Đang hiện' : '⚫ Đang ẩn'}
                  </button>

                  <div className="flex gap-4 text-sm font-semibold">
                    <button onClick={() => openEdit(product)} className="text-blue-500 active:text-blue-700">Sửa</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-500 active:text-red-700">Xóa</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ================= DANH SÁCH DẠNG BẢNG (TABLE VIEW) - CHỈ HIỆN TRÊN DESKTOP ================= */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-4">Ảnh</th>
                <th className="p-4">Tên sản phẩm</th>
                <th className="p-4">Giá</th>
                <th className="p-4">Loại</th>
                <th className="p-4 text-center">Hiển thị</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center">Đang tải...</td></tr>
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
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => toggleVisibility(product.id, product.isVisible !== false)}
                        className={`px-3 py-1 text-xs font-bold rounded-full border transition ${
                          product.isVisible !== false 
                            ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
                            : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {product.isVisible !== false ? 'Đang hiện' : 'Đang ẩn'}
                      </button>
                    </td>
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
        </div>

        {/* THANH PHÂN TRANG */}
        <div className="mt-4 p-4 bg-white md:bg-gray-50 border rounded-xl md:rounded-none md:border-none md:border-t flex flex-col sm:flex-row gap-3 justify-between items-center shadow-sm">
          <span className="text-xs md:text-sm text-gray-500">
            Hiển thị {products.length} / {totalCount} sản phẩm
          </span>
          <div className="flex gap-2 w-full sm:w-auto justify-center">
            <button 
              disabled={page === 1 || loading}
              onClick={() => handlePageChange(false)}
              className="flex-1 sm:flex-none px-4 py-1.5 text-xs md:text-sm border rounded bg-white disabled:opacity-50 hover:bg-gray-100 transition font-medium"
            >
              Trang đầu
            </button>
            <span className="px-4 py-1.5 text-xs md:text-sm font-bold text-orange-600 bg-orange-50 rounded border border-orange-100">
              Trang {page}
            </span>
            <button 
              disabled={products.length < pageSize || loading}
              onClick={() => handlePageChange(true)}
              className="flex-1 sm:flex-none px-4 py-1.5 text-xs md:text-sm border rounded bg-white disabled:opacity-50 hover:bg-gray-100 transition font-medium"
            >
              Tiếp theo
            </button>
          </div>
        </div>

        {/* ================= MODAL FORM CHỈNH SỬA / THÊM MÓN ================= */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 md:p-8 max-w-4xl w-full shadow-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto flex flex-col">
              
              <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-4 md:mb-6 border-b pb-3 md:pb-4 flex justify-between items-center sticky top-0 bg-white z-10">
                <span>{editingId ? "📝 Chỉnh sửa món" : "✨ Thêm món mới"}</span>
                <button type="button" onClick={closeModal} className="sm:hidden text-gray-400 p-1 text-xl">✕</button>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5 flex-1 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Cột trái */}
                  <div className="space-y-4">
                    <label className="block text-xs md:text-sm font-bold text-gray-600">Tiêu đề sản phẩm <span className="text-red-500">*</span>
                      <input type="text" required className="admin-input" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-xs md:text-sm font-bold text-gray-600">Tên ngắn
                        <input type="text" className="admin-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                      </label>
                      <label className="block text-xs md:text-sm font-bold text-gray-600">Tiếng Anh
                        <input type="text" className="admin-input" value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-xs md:text-sm font-bold text-gray-600">Giá bán (VNĐ) <span className="text-red-500">*</span>
                        <input type="number" required className="admin-input" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                      </label>
                      <label className="block text-xs md:text-sm font-bold text-gray-600">Loại
                        <select className="admin-input cursor-pointer" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                          <option value="single">Single</option>
                          <option value="mix">Mix</option>
                          <option value="smoothie">smoothie</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* Cột phải */}
                  <div className="space-y-4">
                    <label className="block text-xs md:text-sm font-bold text-gray-600">Link hình ảnh <span className="text-red-500">*</span>
                      <input type="text" required className="admin-input" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                    </label>
                    <label className="block text-xs md:text-sm font-bold text-gray-600">Tiêu đề phụ
                      <input type="text" className="admin-input" value={formData.sub_title} onChange={(e) => setFormData({...formData, sub_title: e.target.value})} />
                    </label>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="isVisible"
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                        checked={formData.isVisible} 
                        onChange={(e) => setFormData({...formData, isVisible: e.target.checked})} 
                      />
                      <label htmlFor="isVisible" className="text-xs md:text-sm font-bold text-gray-700 cursor-pointer select-none">
                        Hiển thị sản phẩm này trên cửa hàng
                      </label>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-xs md:text-sm font-bold text-gray-600">Mô tả tóm tắt
                    <textarea rows={2} className="admin-input" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </label>
                </div>

                {/* ================= MỤC MỚI: CẤU HÌNH ĐỊNH LƯỢNG HOA QUẢ (ML RECIPE) ================= */}
                <div className="bg-orange-50/40 p-4 md:p-6 rounded-2xl border border-dashed border-orange-200">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <h3 className="text-xs md:text-sm font-black text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                      <HiOutlineBeaker size={18} /> Cấu hình lượng cốt hoa quả cần ép (ml)
                    </h3>
                    <button 
                      type="button" 
                      onClick={addIngredientField} 
                      className="text-[11px] bg-orange-500 text-white px-3 py-1.5 rounded-full font-bold hover:bg-orange-600 transition flex items-center gap-1 shadow-sm"
                    >
                      <HiOutlinePlusCircle size={14} /> Thêm quả
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                        <select 
                          className="flex-1 p-2 border rounded-lg text-xs md:text-sm font-bold text-gray-700 bg-gray-50 outline-none"
                          value={ing.name}
                          onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                        >
                          <option value="">-- Chọn quả --</option>
                          <option value="Pineapple">Quả Dứa (Thơm)</option>
                          <option value="Apple">Quả Táo</option>
                          <option value="Orange">Quả Cam</option>
                          <option value="Ambarella">Quả Cóc</option>
                          <option value="Guava">Quả Ổi</option>
                          <option value="Carrot">Cà rốt</option>
                          <option value="Watermelon">Dưa hấu</option>
                          <option value="lemon">Chanh tươi</option>
                          <option value="avocado">Bơ</option>
                          <option value="Mango">Xoài</option>
                        </select>

                        <div className="flex items-center gap-1.5 w-32">
                          <input 
                            type="number" 
                            className="w-full p-2 border rounded-lg text-xs md:text-sm font-black text-right text-orange-600 outline-none"
                            placeholder="ml"
                            value={ing.ml || ""} 
                            onChange={(e) => updateIngredient(idx, 'ml', e.target.value)} 
                          />
                          <span className="text-xs font-bold text-gray-400">ml</span>
                        </div>

                        <button 
                          type="button" 
                          onClick={() => removeIngredient(idx)} 
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa nguyên liệu"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    ))}
                    {ingredients.length === 0 && (
                      <p className="col-span-2 text-center text-gray-400 text-xs py-4 italic">
                        Chưa cấu hình định lượng (Món nước này sẽ tính mặc định bằng 1 cốc thô bên quầy bar).
                      </p>
                    )}
                  </div>
                </div>

                {/* PHẦN LỢI ÍCH SỨC KHỎE (BENEFITS) */}
                <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-dashed border-gray-300">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <h3 className="text-xs md:text-sm font-black text-gray-500 uppercase tracking-wider">🌟 Lợi ích sức khỏe</h3>
                    <button type="button" onClick={addBenefitField} className="text-[11px] bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-bold hover:bg-gray-200 transition">
                      + Thêm thẻ
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {Array.isArray(benefits) && benefits.map((b, idx) => (
                      <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 bg-white p-3 rounded-xl shadow-sm border text-gray-700 relative pt-7 sm:pt-3">
                        <button type="button" onClick={() => removeBenefit(idx)} className="absolute top-2 right-2 sm:static sm:col-span-1 text-red-400 hover:text-red-600 font-bold text-right sm:text-center text-sm">✕</button>
                        
                        <div className="grid grid-cols-4 sm:contents gap-2">
                          <input className="col-span-1 sm:col-span-1 text-center border rounded-lg p-2 text-sm" placeholder="Icon" value={b.icon} onChange={(e) => updateBenefit(idx, 'icon', e.target.value)} />
                          <input className="col-span-3 sm:col-span-3 border rounded-lg p-2 font-bold text-sm" placeholder="Tiêu đề" value={b.title} onChange={(e) => updateBenefit(idx, 'title', e.target.value)} />
                        </div>
                        <input className="sm:col-span-5 border rounded-lg p-2 text-sm" placeholder="Nội dung chi tiết..." value={b.content} onChange={(e) => updateBenefit(idx, 'content', e.target.value)} />
                        <input className="sm:col-span-2 h-9 w-full rounded-lg cursor-pointer border px-1 text-xs" placeholder="Màu class" value={b.color} onChange={(e) => updateBenefit(idx, 'color', e.target.value)} />
                      </div>
                    ))}
                    {benefits.length === 0 && <p className="text-center text-gray-400 text-xs py-4 italic">Chưa có lợi ích nào được thêm.</p>}
                  </div>
                </div>

                {/* Khối nút lưu thông tin */}
                <div className="flex gap-3 pt-2 sticky bottom-0 bg-white">
                  <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-500 text-sm">Hủy</button>
                  <button type="submit" className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg text-sm">Lưu thông tin</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      {/* Scope Style */}
      <style jsx>{`
        .admin-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          padding: 0.65rem 0.8rem;
          border-radius: 0.75rem;
          outline: none;
          margin-top: 0.3rem;
          font-size: 0.875rem;
          background: white;
          transition: border-color 0.2s;
        }
        .admin-input:focus { border-color: #f97316; }
      `}</style>
    </div>
  );
}