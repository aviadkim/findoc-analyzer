import React from "react";
import { cn } from "../../utils";

interface ValueChangeProps {
  value: number;
  format?: "percentage" | "currency" | "number";
  currencyCode?: string;
  showIndicator?: boolean;
  showPlus?: boolean;
  className?: string;
  zeroIsNeutral?: boolean;
  neutralThreshold?: number;
  precision?: number;
  reverseColors?: boolean;
}

export function ValueChange({
  value,
  format = "number",
  currencyCode = "USD",
  showIndicator = true,
  showPlus = true,
  className,
  zeroIsNeutral = true,
  neutralThreshold = 0,
  precision = 2,
  reverseColors = false,
}: ValueChangeProps) {
  const absValue = Math.abs(value);
  const isZero = Math.abs(value) <= neutralThreshold;
  
  let displayValue: string;
  
  switch (format) {
    case "percentage":
      displayValue = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
        signDisplay: showPlus ? 'exceptZero' : 'auto'
      }).format(value / 100);
      break;
    case "currency":
      displayValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
        signDisplay: showPlus ? 'exceptZero' : 'auto'
      }).format(value);
      break;
    default:
      displayValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: value % 1 === 0 ? 0 : precision,
        maximumFractionDigits: precision,
        signDisplay: showPlus ? 'exceptZero' : 'auto'
      }).format(value);
  }

  let trend: "positive" | "negative" | "neutral" = "neutral";
  if (!isZero || !zeroIsNeutral) {
    trend = value > 0 
      ? (reverseColors ? "negative" : "positive") 
      : value < 0 
        ? (reverseColors ? "positive" : "negative") 
        : "neutral";
  }
  
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium financial",
        trend === "positive" && "text-gain",
        trend === "negative" && "text-loss",
        trend === "neutral" && "text-neutral",
        className
      )}
    >
      {showIndicator && !isZero && (
        <span className="mr-1">
          {trend === "positive" ? "▲" : trend === "negative" ? "▼" : "◆"}
        </span>
      )}
      {displayValue}
    </span>
  );
}