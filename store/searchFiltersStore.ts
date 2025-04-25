import { create } from 'zustand';
import { SortMethod } from '@/app/api/search';

interface SearchFiltersState {
  // Selected filter values
  selectedCuisines: string[];
  selectedDietary: string[];
  priceRange: number[];
  maxDistance: number;
  sortMethod: SortMethod;

  // Actions
  setCuisines: (cuisines: string[]) => void;
  setDietary: (dietary: string[]) => void;
  setPriceRange: (range: number[]) => void;
  setMaxDistance: (distance: number) => void;
  setSortMethod: (method: SortMethod) => void;
  resetFilters: () => void;

  // Helper functions
  addCuisine: (cuisine: string) => void;
  removeCuisine: (cuisine: string) => void;
  addDietary: (dietary: string) => void;
  removeDietary: (dietary: string) => void;
}

type SetState = (
  partial:
    | Partial<SearchFiltersState>
    | ((state: SearchFiltersState) => Partial<SearchFiltersState>)
) => void;

export const useSearchFiltersStore = create<SearchFiltersState>(
  (set: SetState) => ({
    // Default values
    selectedCuisines: [],
    selectedDietary: [],
    priceRange: [],
    maxDistance: 50, // Default to 50km/miles
    sortMethod: SortMethod.BEST_MATCH, // Default to our ranking algorithm

    // Set actions
    setCuisines: (cuisines: string[]) => set({ selectedCuisines: cuisines }),
    setDietary: (dietary: string[]) => set({ selectedDietary: dietary }),
    setPriceRange: (range: number[]) => set({ priceRange: range }),
    setMaxDistance: (distance: number) => set({ maxDistance: distance }),
    setSortMethod: (method: SortMethod) => set({ sortMethod: method }),

    // Reset all filters
    resetFilters: () =>
      set({
        selectedCuisines: [],
        selectedDietary: [],
        priceRange: [],
        maxDistance: 50,
        // Don't reset sort method on filter reset
      }),

    // Helper functions for adding/removing individual items
    addCuisine: (cuisine: string) =>
      set((state: SearchFiltersState) => ({
        selectedCuisines: [...state.selectedCuisines, cuisine],
      })),

    removeCuisine: (cuisine: string) =>
      set((state: SearchFiltersState) => ({
        selectedCuisines: state.selectedCuisines.filter((c) => c !== cuisine),
      })),

    addDietary: (dietary: string) =>
      set((state: SearchFiltersState) => ({
        selectedDietary: [...state.selectedDietary, dietary],
      })),

    removeDietary: (dietary: string) =>
      set((state: SearchFiltersState) => ({
        selectedDietary: state.selectedDietary.filter((d) => d !== dietary),
      })),
  })
);
