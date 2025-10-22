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
