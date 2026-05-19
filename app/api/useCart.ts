import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  cartId: string; // ID duy nhất cho mỗi dòng trong giỏ hàng
  id: string;     // ID gốc của sản phẩm từ Firestore
  title: string;
  price: number;
  image: string;
  quantity: number;
  comment: string;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, qty: number) => void;
  updateComment: (cartId: string, comment: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      
      addToCart: (product) => set((state) => {
        // Chuẩn hóa ghi chú của sản phẩm chuẩn bị thêm vào (tránh lỗi undefined)
        const newComment = (product.comment || "").trim();

        // Tìm xem trong giỏ hàng đã có sản phẩm này với CÙNG một ghi chú chưa
        const existingItemIndex = state.cart.findIndex(
          (item) => item.id === product.id && (item.comment || "").trim() === newComment
        );

        if (existingItemIndex > -1) {
          // Trường hợp 1: Đã tồn tại trùng ID và trùng Ghi chú -> Cộng dồn số lượng
          const updatedCart = [...state.cart];
          updatedCart[existingItemIndex].quantity += product.quantity || 1;
          
          return { cart: updatedCart };
        } else {
          // Trường hợp 2: Sản phẩm mới hoàn toàn (hoặc trùng ID nhưng ghi chú khác) -> Thêm dòng mới
          const newCartItem: CartItem = {
            id: product.id,
            title: product.title,
            image: product.image,
            comment: newComment,
            price: Number(product.price),
            quantity: product.quantity || 1,
            // Tạo cartId duy nhất cho dòng này để phục vụ việc xóa/sửa sau này ở trang giỏ hàng
            cartId: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          };

          return { cart: [...state.cart, newCartItem] };
        }
      }),
      
      removeFromCart: (cartId) => set((state) => ({
        cart: state.cart.filter((item) => item.cartId !== cartId)
      })),

      updateQuantity: (cartId, qty) => set((state) => ({
        cart: state.cart.map((item) =>
          item.cartId === cartId ? { ...item, quantity: Math.max(qty, 1) } : item
        )
      })),

      updateComment: (cartId, comment) => set((state) => ({
        cart: state.cart.map((item) =>
          item.cartId === cartId ? { ...item, comment: comment } : item
        )
      })),

      clearCart: () => set({ cart: [] }),
    }),
    { name: 'juice-cart-storage' }
  )
);