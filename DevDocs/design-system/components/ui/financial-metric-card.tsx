import React from "react";
import { cn } from "../../utils";
import { Card, CardContent } from "./card";

interface FinancialMetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  icon?: React.ReactNode;
  percentChange?: number;
  trend?: "up" | "down" | "neutral";
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  loading?: boolean;
}

export function FinancialMetricCard({
  title,
  value,
  previousValue,
  icon,
  percentChange,
  trend = "neutral",
  className,
  valuePrefix = "",
  valueSuffix = "",
  loading = false,
}: FinancialMetricCardProps) {
  const formattedValue = typeof value === 'number' 
    ? new Intl.NumberFormat('en-US', { 
        maximumFractionDigits: 2,
        minimumFractionDigits: value % 1 === 0 ? 0 : 2
      }).format(value) 
    : value;

  const formattedPercentChange = percentChange !== undefined 
    ? new Intl.NumberFormat('en-US', { 
        style: 'percent', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2,
        signDisplay: 'exceptZero' 
      }).format(percentChange / 100) 
    : null;
  
  return (
    <Card className={cn("metric-card", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="metric-card-title">{title}</h3>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 w-24 bg-muted rounded mt-1"></div>
            <div className="h-4 w-16 bg-muted rounded mt-2"></div>
          </div>
        ) : (
          <>
            <div className="metric-card-value">
              {valuePrefix}{formattedValue}{valueSuffix}
            </div>
            
            {(percentChange !== undefined || previousValue) && (
              <div className={cn(
                "metric-card-change",
                trend === "up" ? "text-gain" : trend === "down" ? "text-loss" : "text-muted-foreground"
              )}>
                {trend === "up" && "▲ "}
                {trend === "down" && "▼ "}
                {formattedPercentChange}{previousValue ? ` from ${previousValue}` : ""}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}