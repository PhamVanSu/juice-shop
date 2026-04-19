import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  cartId: string; // ID duy nhất cho mỗi dòng trong giỏ hàng
  id: string;     // ID gốc của sản phẩm từ Firestore
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, qty: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      
      // SỬA TẠI ĐÂY: Tách dòng sản phẩm
      addToCart: (product) => set((state) => ({
        cart: [
          ...state.cart, 
          { 
            ...product, 
            cartId: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Tạo ID duy nhất cho dòng này
            price: Number(product.price),
            quantity: 1 
          }
        ]
      })),

      removeFromCart: (cartId) => set((state) => ({
        cart: state.cart.filter((item) => item.cartId !== cartId)
      })),

      updateQuantity: (cartId, qty) => set((state) => ({
        cart: state.cart.map((item) =>
          item.cartId === cartId ? { ...item, quantity: Math.max(qty, 1) } : item
        )
      })),

      clearCart: () => set({ cart: [] }),
    }),
    { name: 'juice-cart-storage' }
  )
);