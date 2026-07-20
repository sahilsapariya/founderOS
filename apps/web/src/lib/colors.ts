import type { AccentColor } from "./types";

/**
 * Static class maps for accent colors so Tailwind can see every class at
 * build time (no dynamic string interpolation).
 */
export const accentStyles: Record<
  AccentColor,
  { softBg: string; text: string; bar: string; solid: string }
> = {
  indigo: {
    softBg: "bg-[#6e62f5]/15",
    text: "text-[#a5b4fc]",
    bar: "bg-[#7c6af8]",
    solid: "bg-gradient-to-br from-[#7c6af8] to-[#6e62f5]",
  },
  violet: {
    softBg: "bg-[#a78bfa]/15",
    text: "text-[#c4b5fd]",
    bar: "bg-[#a78bfa]",
    solid: "bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6]",
  },
  sky: {
    softBg: "bg-[#38bdf8]/15",
    text: "text-[#7dd3fc]",
    bar: "bg-[#38bdf8]",
    solid: "bg-gradient-to-br from-[#38bdf8] to-[#0ea5e9]",
  },
  emerald: {
    softBg: "bg-[#34d399]/15",
    text: "text-[#6ee7b7]",
    bar: "bg-[#34d399]",
    solid: "bg-gradient-to-br from-[#34d399] to-[#10b981]",
  },
  amber: {
    softBg: "bg-[#fbbf24]/15",
    text: "text-[#fcd34d]",
    bar: "bg-[#fbbf24]",
    solid: "bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]",
  },
  rose: {
    softBg: "bg-[#fb7185]/15",
    text: "text-[#fda4af]",
    bar: "bg-[#fb7185]",
    solid: "bg-gradient-to-br from-[#fb7185] to-[#f43f5e]",
  },
  slate: {
    softBg: "bg-[#94a3b8]/15",
    text: "text-[#cbd5e1]",
    bar: "bg-[#94a3b8]",
    solid: "bg-gradient-to-br from-[#94a3b8] to-[#64748b]",
  },
};
