export const designTokens = {
  colors: {
    brand: {
      primary: {
        50: "#F3F6FA",
        100: "#E3EAF3",
        200: "#C3D1E3",
        300: "#9AAFCB",
        400: "#718BAF",
        500: "#526E94",
        600: "#3E5679",
        700: "#30445F",
        800: "#25364D",
        900: "#17283D",
        950: "#0C1828",
      },

      secondary: {
        50: "#FFFBEA",
        100: "#FFF4C2",
        200: "#FFE98A",
        300: "#FFDA4F",
        400: "#FBC626",
        500: "#E9AC0B",
        600: "#C78306",
        700: "#9F5D09",
        800: "#834A0F",
        900: "#6F3D12",
        950: "#411F05",
      },
    },

    neutral: {
      white: "#FFFFFF",
      50: "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
      950: "#020617",
      black: "#000000",
    },

    semantic: {
      success: {
        light: "#DCFCE7",
        DEFAULT: "#16A34A",
        dark: "#166534",
      },

      warning: {
        light: "#FEF3C7",
        DEFAULT: "#D97706",
        dark: "#92400E",
      },

      error: {
        light: "#FEE2E2",
        DEFAULT: "#DC2626",
        dark: "#991B1B",
      },

      info: {
        light: "#DBEAFE",
        DEFAULT: "#2563EB",
        dark: "#1E40AF",
      },
    },
  },

  typography: {
    fontFamily: {
      sans: "var(--font-manrope), Arial, Helvetica, sans-serif",
    },

    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
    },

    lineHeight: {
      tight: 1.15,
      snug: 1.3,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  spacing: {
    0: "0rem",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },

  radius: {
    none: "0",
    sm: "0.375rem",
    md: "0.625rem",
    lg: "0.875rem",
    xl: "1.125rem",
    "2xl": "1.5rem",
    full: "9999px",
  },

  shadows: {
    xs: "0 1px 2px rgb(15 23 42 / 0.05)",
    sm: "0 2px 8px rgb(15 23 42 / 0.07)",
    md: "0 8px 24px rgb(15 23 42 / 0.09)",
    lg: "0 16px 40px rgb(15 23 42 / 0.12)",
  },

  transitions: {
    fast: "150ms",
    normal: "250ms",
    slow: "350ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  layout: {
    containerMaxWidth: "1280px",
    contentMaxWidth: "768px",
    headerHeight: "72px",
  },
} as const;

export type DesignTokens = typeof designTokens;