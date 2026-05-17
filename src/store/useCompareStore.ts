import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { normalizeCompareIds } from '@/lib/compare-share';

interface CompareState {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  toggle: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      selectedIds: [],
      setSelectedIds: (ids) => set({ selectedIds: normalizeCompareIds(ids) }),
      toggle: (id) =>
        set((state) => {
          if (state.selectedIds.includes(id)) {
            return {
              selectedIds: state.selectedIds.filter((item) => item !== id),
            };
          }

          return {
            selectedIds: normalizeCompareIds([...state.selectedIds, id]),
          };
        }),
      clear: () => set({ selectedIds: [] }),
      isSelected: (id) => get().selectedIds.includes(id),
    }),
    {
      name: 'flight-codex-compare',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedIds: state.selectedIds,
      }),
    },
  ),
);
