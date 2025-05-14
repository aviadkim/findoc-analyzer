import React from "react";
import { FinancialMetricCard } from "../components/ui/financial-metric-card";
import { DataCard } from "../components/ui/data-card";
import { RiskBadge } from "../components/ui/risk-badge";
import { ValueChange } from "../components/ui/value-change";
import { FinancialDataTable } from "../components/ui/financial-data-table";
import { Button } from "../components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Percent,
  BarChart4,
  PieChart,
} from "lucide-react";

// Sample data for the financial dashboard
const portfolioMetrics = {
  totalValue: 1345789.45,
  previousValue: 1298456.21,
  percentChange: 3.64,
  cashBalance: 45678.12,
  cashPercentChange: -2.34,
  roi: 8.76,
  roiPercentChange: 1.23,
  risk: "medium" as const,
};

// Sample data for the holdings table
const holdingsData = [
  { id: 1, ticker: "AAPL", name: "Apple Inc.", shares: 150, price: 178.85, value: 26827.50, change: 2.5, allocation: 6.23 },
  { id: 2, ticker: "MSFT", name: "Microsoft Corp.", shares: 100, price: 334.27, value: 33427.00, change: 1.8, allocation: 7.76 },
  { id: 3, ticker: "AMZN", name: "Amazon.com Inc.", shares: 80, price: 127.74, value: 10219.20, change: -0.5, allocation: 2.37 },
  { id: 4, ticker: "GOOGL", name: "Alphabet Inc.", shares: 60, price: 142.56, value: 8553.60, change: 0.7, allocation: 1.99 },
  { id: 5, ticker: "META", name: "Meta Platforms Inc.", shares: 90, price: 302.55, value: 27229.50, change: 3.2, allocation: 6.32 },
];

// Column definitions for the holdings table
const holdingsColumns = [
  {
    accessorKey: "ticker",
    header: "Ticker",
    cell: ({ row }: any) => (
      <div className="font-medium">{row.getValue("ticker")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "shares",
    header: "Shares",
    cell: ({ row }: any) => (
      <div className="text-right financial">{row.getValue("shares")}</div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }: any) => (
      <div className="text-right financial">${row.getValue("price").toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }: any) => (
      <div className="text-right financial">${row.getValue("value").toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "change",
    header: "Change (24h)",
    cell: ({ row }: any) => (
      <ValueChange value={row.getValue("change")} format="percentage" />
    ),
  },
  {
    accessorKey: "allocation",
    header: "Allocation",
    cell: ({ row }: any) => (
      <div className="text-right financial">{row.getValue("allocation").toFixed(2)}%</div>
    ),
  },
];

export default function FinancialDashboardExample() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
        <div className="flex items-center gap-2">
          <RiskBadge level={portfolioMetrics.risk} label="Portfolio Risk" />
          <Button variant="outline" size="sm">Export</Button>
          <Button size="sm">Rebalance</Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialMetricCard
          title="Total Portfolio Value"
          value={portfolioMetrics.totalValue}
          previousValue={portfolioMetrics.previousValue.toLocaleString()}
          percentChange={portfolioMetrics.percentChange}
          trend="up"
          valuePrefix="$"
          icon={<DollarSign className="h-4 w-4" />}
        />
        
        <FinancialMetricCard
          title="Cash Balance"
          value={portfolioMetrics.cashBalance}
          percentChange={portfolioMetrics.cashPercentChange}
          trend="down"
          valuePrefix="$"
          icon={<DollarSign className="h-4 w-4" />}
        />
        
        <FinancialMetricCard
          title="ROI (YTD)"
          value={portfolioMetrics.roi}
          percentChange={portfolioMetrics.roiPercentChange}
          trend="up"
          valueSuffix="%"
          icon={<Percent className="h-4 w-4" />}
        />
        
        <FinancialMetricCard
          title="Market Trend"
          value="Bullish"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DataCard
          title="Portfolio Performance"
          description="Last 30 days"
          headerAction={<Button variant="ghost" size="sm">View All</Button>}
        >
          <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
            <div className="flex flex-col items-center text-muted-foreground">
              <BarChart4 className="h-10 w-10 mb-2" />
              <p>Performance Chart Would Render Here</p>
            </div>
          </div>
        </DataCard>
        
        <DataCard
          title="Asset Allocation"
          headerAction={<Button variant="ghost" size="sm">Details</Button>}
        >
          <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
            <div className="flex flex-col items-center text-muted-foreground">
              <PieChart className="h-10 w-10 mb-2" />
              <p>Allocation Chart Would Render Here</p>
            </div>
          </div>
        </DataCard>
      </div>

      {/* Holdings Table */}
      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Portfolio Holdings</h2>
        </div>
        <div className="p-6">
          <FinancialDataTable
            columns={holdingsColumns}
            data={holdingsData}
            searchColumn="ticker"
            showPagination={true}
            pageSize={5}
          />
        </div>
      </div>
    </div>
  );
}