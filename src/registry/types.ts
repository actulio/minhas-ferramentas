import { type ComponentType } from 'react';

export type AppCategory = 'financas' | 'utilidades' | 'conversores';

export interface SettingsField {
  key: string;
  label: string;
  type: 'number' | 'select' | 'toggle';
  defaultValue: number | string | boolean;
  options?: { label: string; value: number | string }[];
}

export interface MiniAppConfig {
  id: string;
  name: string;
  description: string;
  category: AppCategory;
  icon: string;
  component: ComponentType;
  persistence?: {
    enabled: boolean;
    storageKey: string;
  };
  settings?: SettingsField[];
}

export const categoryLabels: Record<AppCategory, string> = {
  financas: 'Finanças',
  utilidades: 'Utilidades',
  conversores: 'Conversores',
};

export const categoryOrder: AppCategory[] = [
  'financas',
  'utilidades',
  'conversores',
];
