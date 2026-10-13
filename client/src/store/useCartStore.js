import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      shippingThreshold: 999,
      standardShippingFee: 69,

      addItem: (item) => {
        const { items } = get();
        // Identify variant uniquely by productId + variantId (or size+color)
        const existingIndex = items.findIndex(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );

        if (existingIndex > -1) {
          const updated = [...items];
          updated[existingIndex].quantity += item.quantity || 1;
          set({ items: updated });
        } else {
          set({ items: [...items, { ...item, quantity: item.quantity || 1 }] });
        }
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      // Computed selectors
      getTotalCount: () => {
        return get().items.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (acc, curr) => acc + (curr.price || 0) * (curr.quantity || 0),
          0
        );
      },

      getTotalMrp: () => {
        return get().items.reduce(
          (acc, curr) => acc + (curr.mrp || curr.price || 0) * (curr.quantity || 0),
          0
        );
      },

      getSavings: () => {
        const mrp = get().getTotalMrp();
        const subtotal = get().getSubtotal();
        return Math.max(0, mrp - subtotal);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= get().shippingThreshold ? 0 : get().standardShippingFee;
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingFee();
        return subtotal + shipping;
      },

      getProgressToFreeShipping: () => {
        const subtotal = get().getSubtotal();
        const threshold = get().shippingThreshold;
        return Math.min(100, Math.round((subtotal / threshold) * 100));
      },

      getRemainingForFreeShipping: () => {
        const subtotal = get().getSubtotal();
        const threshold = get().shippingThreshold;
        return Math.max(0, threshold - subtotal);
      },
    }),
    {
      name: 'kurtikatha_cart',
    }
  )
);
