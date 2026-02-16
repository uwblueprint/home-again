/**
 * UI Store
 *
 * Manages global UI state including:
 * - Selected region (for multi-region support)
 * - Theme preferences
 * - Sidebar state
 *
 * This state is separate from auth to keep concerns divided and
 * prevent unnecessary re-renders across unrelated components.
 */

import { create } from "zustand";

interface UIStore {
  selectedRegion: string | null;
  sidebarOpen: boolean;
  setSelectedRegion: (region: string | null) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedRegion: null,
  sidebarOpen: true,
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
