import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  isSearchModalOpen: false,
  isFilterSheetOpen: false,
  
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
  
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  
  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),
  
  openFilterSheet: () => set({ isFilterSheetOpen: true }),
  closeFilterSheet: () => set({ isFilterSheetOpen: false }),
}));
