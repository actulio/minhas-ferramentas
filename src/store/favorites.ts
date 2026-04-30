import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavoritesStore {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (id: string) => {
        const current = get().favoriteIds;
        if (current.includes(id)) {
          set({ favoriteIds: current.filter((fid) => fid !== id) });
        } else {
          set({ favoriteIds: [...current, id] });
        }
      },

      isFavorite: (id: string) => {
        return get().favoriteIds.includes(id);
      },
    }),
    {
      name: "minhas-ferramentas-favorites",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
