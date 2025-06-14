import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const gradients = {
  none: "",
  sunset: "bg-gradient-to-br from-orange-500 via-red-500 to-purple-500",
  ocean: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  forest: "bg-gradient-to-br from-green-400 via-green-500 to-green-600",
  lavender: "bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600",
  midnight: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
  sunrise: "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500",
  custom: "bg-gradient-to-br",
} as const;

export const fonts = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
  inter: "font-inter",
  poppins: "font-poppins",
  roboto: "font-roboto",
} as const;

export const textGradients = {
  none: "",
  purple: "bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent",
  blue: "bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent",
  sunset: "bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 bg-clip-text text-transparent",
  ocean: "bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent",
  custom: "bg-clip-text text-transparent",
} as const;

export type GradientType = keyof typeof gradients;
export type FontType = keyof typeof fonts;
export type TextGradientType = keyof typeof textGradients; 