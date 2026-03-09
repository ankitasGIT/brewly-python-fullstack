import { create } from "zustand";

export interface CartItem {
  productId: string;
  variationId: string;
  productName: string;
  variationName: string;
  priceCents: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, variationId: string) => void;
  updateQuantity: (productId: string, variationId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  totalCents: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (item) => {
    const existing = get().items.find(
      (i) => i.productId === item.productId && i.variationId === item.variationId
    );
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.productId === item.productId && i.variationId === item.variationId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      set({ items: [...get().items, { ...item, quantity: 1 }] });
    }
  },

  removeItem: (productId, variationId) => {
    set({
      items: get().items.filter(
        (i) => !(i.productId === productId && i.variationId === variationId)
      ),
    });
  },

  updateQuantity: (productId, variationId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, variationId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.productId === productId && i.variationId === variationId
          ? { ...i, quantity }
          : i
      ),
    });
  },

  clearCart: () => set({ items: [] }),
  toggleCart: () => set({ isOpen: !get().isOpen }),
  setCartOpen: (open) => set({ isOpen: open }),

  totalCents: () => get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
