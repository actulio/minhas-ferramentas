export const colors = {
  bg: {
    start: '#020617',
    mid: '#0c1a3d',
    end: '#091525',
  },
  accent: {
    start: '#3b82f6',
    end: '#0ea5e9',
  },
  glass: {
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.15)',
    bgHover: 'rgba(59,130,246,0.12)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#64748b',
    accent: '#93c5fd',
    muted: '#475569',
  },
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
} as const;

export type Colors = typeof colors;
