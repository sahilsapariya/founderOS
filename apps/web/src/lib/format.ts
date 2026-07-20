/**
 * Formatting helpers. Currency uses the Indian numbering system
 * (lakh/crore grouping) per the product's primary market.
 */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value: number): string {
  return inr.format(value);
}

/** Compact form for chart axes: 1.5L, 80K, 1.2Cr */
export function formatINRCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (abs >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1).replace(/\.0$/, "")}L`;
  if (abs >= 1_000) return `₹${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${value}`;
}

export function formatPercent(value: number, signed = false): string {
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

export function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "F"
  );
}

export function timeBasedGreeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
