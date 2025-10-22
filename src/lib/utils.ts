import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple color map for avatar colors
const avatarColorMap: Record<string, string> = {
  orange: "bg-avatar-orange",
  amber: "bg-avatar-amber",
  yellow: "bg-avatar-yellow",
  lime: "bg-avatar-lime",
  green: "bg-avatar-green",
  emerald: "bg-avatar-emerald",
  teal: "bg-avatar-teal",
  cyan: "bg-avatar-cyan",
  sky: "bg-avatar-sky",
  blue: "bg-avatar-blue",
  indigo: "bg-avatar-indigo",
  violet: "bg-avatar-violet",
  purple: "bg-avatar-purple",
  fuchsia: "bg-avatar-fuchsia",
  pink: "bg-avatar-pink",
  rose: "bg-avatar-rose",
};

export function getAvatarColorClass(
  colorName: string | null | undefined
): string {
  if (!colorName) return "bg-avatar-default";
  return avatarColorMap[colorName] || "bg-avatar-default";
}

// Simple color map for avatar border colors
const avatarBorderColorMap: Record<string, string> = {
  orange: "border-avatar-border-orange",
  amber: "border-avatar-border-amber",
  yellow: "border-avatar-border-yellow",
  lime: "border-avatar-border-lime",
  green: "border-avatar-border-green",
  emerald: "border-avatar-border-emerald",
  teal: "border-avatar-border-teal",
  cyan: "border-avatar-border-cyan",
  sky: "border-avatar-border-sky",
  blue: "border-avatar-border-blue",
  indigo: "border-avatar-border-indigo",
  violet: "border-avatar-border-violet",
  purple: "border-avatar-border-purple",
  fuchsia: "border-avatar-border-fuchsia",
  pink: "border-avatar-border-pink",
  rose: "border-avatar-border-rose",
};

export function getAvatarBorderColorClass(
  colorName: string | null | undefined
): string {
  if (!colorName) return "border-avatar-border-default";
  return avatarBorderColorMap[colorName] || "border-avatar-border-default";
}

// Color map for hex values to calculate contrast
const avatarColorHexMap: Record<string, string> = {
  orange: "#f97316",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  pink: "#ec4899",
  rose: "#f43f5e",
};

// Convert any color format to RGB
function parseColorToRgb(
  color: string
): { r: number; g: number; b: number } | null {
  // Handle hex colors (#fff, #ffffff, fff, ffffff)
  if (/^#?[0-9a-f]{3}$/i.test(color)) {
    const hex = color.replace("#", "");
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  if (/^#?[0-9a-f]{6}$/i.test(color)) {
    const hex = color.replace("#", "");
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16),
    };
  }

  // Handle rgb() format
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // Handle rgba() format
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
    };
  }

  // Handle hsl() format
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    return hslToRgb(h, s, l);
  }

  // Handle hsla() format
  const hslaMatch = color.match(/hsla\((\d+),\s*(\d+)%,\s*(\d+)%,\s*[\d.]+\)/);
  if (hslaMatch) {
    const h = parseInt(hslaMatch[1]) / 360;
    const s = parseInt(hslaMatch[2]) / 100;
    const l = parseInt(hslaMatch[3]) / 100;
    return hslToRgb(h, s, l);
  }

  // Handle named colors (fallback to predefined map)
  const namedColor = avatarColorHexMap[color.toLowerCase()];
  if (namedColor) {
    return parseColorToRgb(namedColor);
  }

  return null;
}

// Convert HSL to RGB
function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Determine if text should be dark or light for maximum contrast
export function getAvatarTextColorClass(
  color: string | null | undefined
): string {
  if (!color) {
    // Default to light text for the default red color
    return "text-white";
  }

  const rgb = parseColorToRgb(color);
  if (!rgb) {
    return "text-white"; // fallback to light text
  }

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  // Use light text (white) for dark backgrounds, dark text (black) for light backgrounds
  // Threshold of 0.5 is a good balance for readability
  return luminance > 0.5 ? "text-black" : "text-white";
}
