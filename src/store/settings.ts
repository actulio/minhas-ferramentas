import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { appRegistry } from "@/registry";
import { type SettingsField } from "@/registry/types";

interface SettingsStore {
  values: Record<string, Record<string, number | string | boolean>>;
  getSetting: (appId: string, key: string) => number | string | boolean;
  setSetting: (
    appId: string,
    key: string,
    value: number | string | boolean,
  ) => void;
}

function findDefault(appId: string, key: string): number | string | boolean {
  const app = appRegistry.find((a) => a.id === appId);
  const field = app?.settings?.find((s: SettingsField) => s.key === key);
  return field?.defaultValue ?? "";
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      values: {},

      getSetting: (appId: string, key: string) => {
        return get().values[appId]?.[key] ?? findDefault(appId, key);
      },

      setSetting: (
        appId: string,
        key: string,
        value: number | string | boolean,
      ) => {
        const current = get().values;
        set({
          values: {
            ...current,
            [appId]: {
              ...current[appId],
              [key]: value,
            },
          },
        });
      },
    }),
    {
      name: "minhas-ferramentas-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
