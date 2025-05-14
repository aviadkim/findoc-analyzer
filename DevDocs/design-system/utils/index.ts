import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for combining Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency values
export function formatCurrency(
  value: number,
  currencyCode = "USD",
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

// Format percentage values
export function formatPercentage(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value / 100);
}

// Format number values
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

// Get trend direction from change value
export function getTrend(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}

// Get CSS classes for trend direction
export function getTrendClass(trend: "up" | "down" | "neutral"): string {
  switch (trend) {
    case "up":
      return "text-gain";
    case "down":
      return "text-loss";
    case "neutral":
    default:
      return "text-neutral";
  }
}

// Determine risk level based on a value
export function getRiskLevel(value: number): "low" | "medium" | "high" {
  if (value < 0.3) return "low";
  if (value < 0.7) return "medium";
  return "high";
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Format a date for financial contexts
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(dateObj);
}

// Get color by risk level
export function getRiskColor(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "low":
      return "var(--low-risk)";
    case "medium":
      return "var(--medium-risk)";
    case "high":
      return "var(--high-risk)";
    default:
      return "var(--neutral)";
  }
}

// Calculate contrast ratio between two colors (useful for accessibility checks)
export function getContrastRatio(foreground: string, background: string): number {
  // This is a simplified implementation
  // For a real implementation, convert colors to luminance values first
  return 4.5; // Placeholder return for this example
}