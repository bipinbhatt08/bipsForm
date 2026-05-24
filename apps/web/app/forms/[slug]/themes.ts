import type React from "react"

export interface FormTheme {
  backgroundColor?: string
  cardBackground?: string
  inputBackground?: string
  accentColor?: string
  accentForeground?: string
  textColor?: string
  mutedColor?: string
  borderColor?: string
  borderRadius?: string
  fontFamily?: string
  cardShadow?: string
}

export function themeToVars(t: FormTheme): React.CSSProperties {
  return {
    ...(t.backgroundColor  && { "--form-bg": t.backgroundColor }),
    ...(t.cardBackground   && { "--form-card-bg": t.cardBackground }),
    ...(t.inputBackground  && { "--form-input-bg": t.inputBackground }),
    ...(t.accentColor      && { "--form-accent": t.accentColor }),
    ...(t.accentForeground && { "--form-accent-fg": t.accentForeground }),
    ...(t.textColor        && { "--form-text": t.textColor }),
    ...(t.mutedColor       && { "--form-muted": t.mutedColor }),
    ...(t.borderColor      && { "--form-border": t.borderColor }),
    ...(t.borderRadius     && { "--form-radius": t.borderRadius }),
    ...(t.cardShadow       && { "--form-card-shadow": t.cardShadow }),
    ...(t.fontFamily       && { fontFamily: t.fontFamily }),
  } as React.CSSProperties
}

export const THEMES: Record<string, { label: string; swatch: string; theme: FormTheme }> = {
  minimal: {
    label: "Minimal",
    swatch: "#71717a",
    theme: {
      backgroundColor: "#f4f4f5",
      cardBackground: "#ffffff",
      inputBackground: "#fafafa",
      accentColor: "#18181b",
      accentForeground: "#ffffff",
      textColor: "#18181b",
      mutedColor: "#71717a",
      borderColor: "#e4e4e7",
      borderRadius: "0.5rem",
      fontFamily: "system-ui, -apple-system, sans-serif",
      cardShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },
  },
  retro: {
    label: "Retro",
    swatch: "#92400e",
    theme: {
      backgroundColor: "#f5efe0",
      cardBackground: "#fefcf5",
      inputBackground: "#fdf8ed",
      accentColor: "#92400e",
      accentForeground: "#fefcf5",
      textColor: "#2c1810",
      mutedColor: "#78614a",
      borderColor: "#c8a87a",
      borderRadius: "0.25rem",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      cardShadow: "4px 4px 0px #c8a87a",
    },
  },
  anime: {
    label: "Anime",
    swatch: "#db2777",
    theme: {
      backgroundColor: "#fdf0f8",
      cardBackground: "#fff5fb",
      inputBackground: "#fff0f7",
      accentColor: "#db2777",
      accentForeground: "#ffffff",
      textColor: "#4a0030",
      mutedColor: "#be185d",
      borderColor: "#f9a8d4",
      borderRadius: "1.25rem",
      fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
      cardShadow: "0 4px 24px rgba(219,39,119,0.10)",
    },
  },
  neon: {
    label: "Neon",
    swatch: "#00ff88",
    theme: {
      backgroundColor: "#050510",
      cardBackground: "#0a0a1e",
      inputBackground: "#06061a",
      accentColor: "#00ff88",
      accentForeground: "#050510",
      textColor: "#d0d0ff",
      mutedColor: "#5050a0",
      borderColor: "#1a1a44",
      borderRadius: "0.375rem",
      fontFamily: "'Courier New', Courier, monospace",
      cardShadow: "0 0 0 1px rgba(0,255,136,0.18), 0 0 28px rgba(0,255,136,0.07)",
    },
  },
  nature: {
    label: "Nature",
    swatch: "#15803d",
    theme: {
      backgroundColor: "#eef7ee",
      cardBackground: "#f7fcf7",
      inputBackground: "#f0faf0",
      accentColor: "#15803d",
      accentForeground: "#ffffff",
      textColor: "#14532d",
      mutedColor: "#4d7054",
      borderColor: "#bbf7d0",
      borderRadius: "0.875rem",
      fontFamily: "'Georgia', serif",
      cardShadow: "0 2px 16px rgba(21,128,61,0.08)",
    },
  },
}

export const DEFAULT_THEME_KEY = "minimal"
