import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Typography, MutedText } from "@/components/ui-library/atoms/Typography";
import { Badge } from "@/components/ui-library/atoms/Badge";
import { Icon } from "@/components/ui-library/atoms/Icon";
import { cn } from "@/lib/utils";

/**
 * Props for the DataCard component
 */
interface DataCardProps {
  /** Main title of the data card */
  title: string;
  /** Optional description or subtitle */
  description?: string;
  /** Primary value to display prominently */
  value: string | number;
  /** Unit or label for the value (e.g., "$", "%") */
  unit?: string;
  /** Optional previous value for comparison */
  previousValue?: string | number;
  /** Optional change indicator (positive, negative, neutral) */
  trend?: 'positive' | 'negative' | 'neutral';
  /** Optional percentage change value */
  changePercentage?: number;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Optional CSS class names */
  className?: string;
  /** Whether to format the card in a compact style */
  compact?: boolean;
  /** Optional onClick handler */
  onClick?: () => void;
}

/**
 * DataCard component displays a key metric or data point
 * with optional trend indicators and comparisons
 */
export function DataCard({
  title,
  description,
  value,
  unit = '',
  previousValue,
  trend,
  changePercentage,
  icon,
  footer,
  className,
  compact = false,
  onClick,
}: DataCardProps) {
  // Determine color and icon for trend
  const trendColor = trend === 'positive' 
    ? 'text-green-500' 
    : trend === 'negative' 
      ? 'text-red-500' 
      : 'text-gray-500';
  
  const trendIcon = trend === 'positive' 
    ? <Icon name="TrendingUp" size={16} className={trendColor} /> 
    : trend === 'negative' 
      ? <Icon name="TrendingDown" size={16} className={trendColor} /> 
      : null;
  
  // Format change percentage
  const formattedChange = changePercentage 
    ? `${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(2)}%` 
    : null;

  return (
    <Card 
      className={cn(
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        compact && "p-0",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn(compact && "p-4 pb-2")}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className={cn("text-sm font-medium", compact && "text-xs")}>{title}</CardTitle>
            {description && (
              <CardDescription className={cn(compact && "text-xs")}>{description}</CardDescription>
            )}
          </div>
          {icon && <div>{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className={cn(compact && "p-4 pt-0")}>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {typeof value === 'number' && unit ? `${unit}${value}` : value}
          </div>
          
          {(trend || previousValue || changePercentage) && (
            <div className="flex items-center space-x-1">
              {trendIcon}
              {formattedChange && (
                <span className={trendColor}>{formattedChange}</span>
              )}
              {previousValue && (
                <MutedText as="span" className="text-xs">
                  from {typeof previousValue === 'number' && unit ? `${unit}${previousValue}` : previousValue}
                </MutedText>
              )}
            </div>
          )}
          
          {footer && <div className="pt-2">{footer}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Usage examples:
 * 
 * <DataCard
 *   title="Total Portfolio Value"
 *   value={125000}
 *   unit="$"
 *   trend="positive"
 *   changePercentage={5.2}
 *   previousValue={118000}
 *   icon={<Icon name="DollarSign" />}
 * />
 * 
 * <DataCard
 *   title="Securities Count"
 *   value={12}
 *   compact
 *   footer={<Badge variant="info">Balanced</Badge>}
 * />
 */