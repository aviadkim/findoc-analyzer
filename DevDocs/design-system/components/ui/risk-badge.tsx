import React from "react";
import { cn } from "../../utils";

interface RiskBadgeProps {
  level: "low" | "medium" | "high";
  label?: string;
  showIndicator?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({
  level,
  label,
  showIndicator = true,
  className,
  size = "md",
}: RiskBadgeProps) {
  const displayLabel = label || level.charAt(0).toUpperCase() + level.slice(1);
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-2.5 py-0.5",
        size === "lg" && "text-base px-3 py-1",
        level === "low" && "bg-risk-low/10 text-risk-low",
        level === "medium" && "bg-risk-medium/10 text-risk-medium",
        level === "high" && "bg-risk-high/10 text-risk-high",
        className
      )}
    >
      {showIndicator && (
        <span
          className={cn(
            "inline-block rounded-full mr-1",
            size === "sm" && "w-1.5 h-1.5",
            size === "md" && "w-2 h-2",
            size === "lg" && "w-2.5 h-2.5",
            level === "low" && "bg-risk-low",
            level === "medium" && "bg-risk-medium",
            level === "high" && "bg-risk-high"
          )}
        />
      )}
      {displayLabel}
    </span>
  );
}