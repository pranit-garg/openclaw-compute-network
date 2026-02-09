/**
 * Theme constants — dark mode colors matching the Dispatch landing page.
 * Consistent with https://landing-pi-ashen-62.vercel.app
 */
export const colors = {
  background: "#0a0a0f",
  surface: "#1a1a2e",
  surfaceLight: "#252540",
  border: "#2a2a45",
  accent: "#6366f1", // Indigo
  accentLight: "#818cf8",
  accentDim: "#4f46e5",
  success: "#22c55e",
  error: "#ef4444",
  warning: "#eab308",
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  textDim: "#64748b",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;
