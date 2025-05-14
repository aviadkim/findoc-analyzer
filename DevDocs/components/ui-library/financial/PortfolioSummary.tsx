import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-library/atoms/Icon";
import { DataCard } from "@/components/ui-library/molecules/DataCard";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";

/**
 * Portfolio summary data interface
 */
export interface PortfolioSummaryData {
  /** Total portfolio value */
  totalValue: number;
  /** Previous total value (for comparison) */
  previousValue?: number;
  /** Total gain/loss amount */
  totalGainLoss?: number;
  /** Total gain/loss percentage */
  totalGainLossPercent?: number;
  /** Number of securities in portfolio */
  securitiesCount?: number;
  /** Diversification score (0-100) */
  diversificationScore?: number;
  /** Portfolio risk level (0-100) */
  riskLevel?: number;
  /** Risk assessment (e.g., "Low", "Moderate", "High") */
  riskAssessment?: string;
  /** Monthly income from portfolio */
  monthlyIncome?: number;
  /** Annual yield percentage */
  annualYield?: number;
  /** Portfolio performance over various time periods */
  performance?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    quarterly?: number;
    yearly?: number;
    ytd?: number;
  };
  /** Asset allocation percentages by category */
  allocation?: Record<string, number>;
  /** Currency used for monetary values */
  currency?: string;
  /** Last update date/time */
  lastUpdated?: string;
}

/**
 * Props for PortfolioSummary component
 */
interface PortfolioSummaryProps {
  /** Portfolio summary data */
  data: PortfolioSummaryData;
  /** Whether to use a compact layout */
  compact?: boolean;
  /** Optional title override */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Whether to show a refresh button */
  showRefresh?: boolean;
  /** Callback for refresh button */
  onRefresh?: () => void;
  /** Whether the data is currently loading */
  isLoading?: boolean;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Optional extra actions */
  actions?: React.ReactNode;
  /** Optional CSS class names */
  className?: string;
}

/**
 * PortfolioSummary component for displaying portfolio overview data
 */
export function PortfolioSummary({
  data,
  compact = false,
  title = "Portfolio Summary",
  subtitle,
  showRefresh = false,
  onRefresh,
  isLoading = false,
  footer,
  actions,
  className,
}: PortfolioSummaryProps) {
  // Determine trend based on total gain/loss
  const trend = data.totalGainLoss === undefined
    ? undefined
    : data.totalGainLoss >= 0 ? 'positive' : 'negative';

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn(compact && "p-4")}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={cn(compact && "text-lg")}>{title}</CardTitle>
            {subtitle && (
              <CardDescription>{subtitle}</CardDescription>
            )}
            {data.lastUpdated && (
              <CardDescription className={cn(compact && "text-xs")}>
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {showRefresh && onRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRefresh}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Icon 
                  name={isLoading ? "Loader" : "RefreshCw"} 
                  className={cn(isLoading && "animate-spin")} 
                />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        compact && "p-4 pt-0"
      )}>
        {/* Total Value */}
        <DataCard
          title="Total Value"
          value={formatCurrency(data.totalValue, { currency: data.currency })}
          previousValue={data.previousValue}
          trend={trend}
          changePercentage={data.totalGainLossPercent}
          icon={<Icon name="DollarSign" className="h-4 w-4" />}
          compact={compact}
        />

        {/* Securities Count */}
        {data.securitiesCount !== undefined && (
          <DataCard
            title="Securities"
            value={data.securitiesCount}
            icon={<Icon name="Briefcase" className="h-4 w-4" />}
            compact={compact}
          />
        )}

        {/* Diversification Score */}
        {data.diversificationScore !== undefined && (
          <DataCard
            title="Diversification"
            value={formatPercentage(data.diversificationScore)}
            icon={<Icon name="PieChart" className="h-4 w-4" />}
            compact={compact}
          />
        )}

        {/* Risk Level */}
        {(data.riskLevel !== undefined || data.riskAssessment) && (
          <DataCard
            title="Risk Level"
            value={data.riskAssessment || formatPercentage(data.riskLevel || 0)}
            icon={<Icon name="ActivitySquare" className="h-4 w-4" />}
            compact={compact}
          />
        )}

        {/* Annual Yield */}
        {data.annualYield !== undefined && (
          <DataCard
            title="Annual Yield"
            value={formatPercentage(data.annualYield)}
            icon={<Icon name="TrendingUp" className="h-4 w-4" />}
            compact={compact}
          />
        )}

        {/* Monthly Income */}
        {data.monthlyIncome !== undefined && (
          <DataCard
            title="Monthly Income"
            value={formatCurrency(data.monthlyIncome, { currency: data.currency })}
            icon={<Icon name="Landmark" className="h-4 w-4" />}
            compact={compact}
          />
        )}

        {/* Performance - show up to 2 most relevant performance metrics */}
        {data.performance && Object.entries(data.performance).slice(0, 2).map(([period, value]) => (
          <DataCard
            key={period}
            title={`${period.charAt(0).toUpperCase() + period.slice(1)} Return`}
            value={formatPercentage(value)}
            trend={value >= 0 ? 'positive' : 'negative'}
            icon={<Icon name="LineChart" className="h-4 w-4" />}
            compact={compact}
          />
        ))}
      </CardContent>

      {footer && (
        <CardFooter className={cn(
          "border-t bg-muted/50 px-6 py-3",
          compact && "px-4 py-2 text-sm"
        )}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Usage example:
 * 
 * const portfolioData: PortfolioSummaryData = {
 *   totalValue: 125750.42,
 *   previousValue: 120500.10,
 *   totalGainLoss: 5250.32,
 *   totalGainLossPercent: 4.36,
 *   securitiesCount: 18,
 *   diversificationScore: 82,
 *   riskLevel: 45,
 *   riskAssessment: "Moderate",
 *   monthlyIncome: 425.50,
 *   annualYield: 4.12,
 *   performance: {
 *     daily: 0.28,
 *     weekly: 1.15,
 *     monthly: 2.73,
 *     quarterly: 5.21,
 *     yearly: 12.8,
 *     ytd: 8.45
 *   },
 *   allocation: {
 *     "Stocks": 65,
 *     "Bonds": 25,
 *     "Cash": 5,
 *     "Alternative": 5
 *   },
 *   currency: "USD",
 *   lastUpdated: "2025-05-12T15:30:00Z"
 * };
 * 
 * <PortfolioSummary
 *   data={portfolioData}
 *   showRefresh
 *   onRefresh={() => console.log("Refreshing data...")}
 *   actions={
 *     <Button variant="outline" size="sm">
 *       <Icon name="Download" className="mr-2 h-4 w-4" />
 *       Export
 *     </Button>
 *   }
 *   footer={
 *     <div className="flex justify-between w-full">
 *       <span className="text-muted-foreground">Portfolio ID: 12345</span>
 *       <Button variant="link" size="sm">View detailed report</Button>
 *     </div>
 *   }
 * />
 */