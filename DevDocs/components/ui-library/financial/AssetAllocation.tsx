import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-library/atoms/Icon";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip, 
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { cn } from "@/lib/utils";

/**
 * Allocation data item interface
 */
export interface AllocationItem {
  /** Category name (e.g., "Stocks", "Technology") */
  name: string;
  /** Value (either amount or percentage) */
  value: number;
  /** Optional display color */
  color?: string;
  /** Optional subcategories */
  children?: AllocationItem[];
}

/**
 * Allocation data interface
 */
export interface AllocationData {
  /** Assets by class (e.g., Stocks, Bonds, Cash) */
  byAssetClass: AllocationItem[];
  /** Assets by sector (e.g., Technology, Healthcare) */
  bySector?: AllocationItem[];
  /** Assets by geography (e.g., US, Europe, Asia) */
  byGeography?: AllocationItem[];
  /** Assets by currency */
  byCurrency?: AllocationItem[];
  /** Assets by other custom category */
  [key: string]: AllocationItem[] | undefined;
}

/**
 * Props for AssetAllocation component
 */
interface AssetAllocationProps {
  /** Allocation data */
  data: AllocationData;
  /** Whether values are amounts (true) or percentages (false) */
  amountsMode?: boolean;
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
  /** Whether to use a compact layout */
  compact?: boolean;
  /** Optional CSS class names */
  className?: string;
  /** Optional chart height */
  chartHeight?: number;
  /** Optional color scheme for the chart */
  colorScheme?: string[];
}

/**
 * Default color schemes for charts
 */
const COLOR_SCHEMES = {
  default: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A5668B', '#69306D', '#536D79', '#708B75'],
  blue: ['#004B8D', '#006FCF', '#0087E9', '#25A0F9', '#47B3FF', '#70C7FF', '#8FD3FF', '#B8E2FF'],
  green: ['#004B23', '#006400', '#007200', '#008000', '#38B000', '#70E000', '#9EF01A', '#CCFF33'],
  warm: ['#7F0000', '#A31621', '#D81E5B', '#EB8A90', '#FAAAAA', '#FCDADA', '#F9B4ED', '#FF90E8'],
  neutral: ['#0F172A', '#1E293B', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#F1F5F9'],
};

/**
 * Generates a color for a chart segment
 */
const getColor = (index: number, colorScheme: string[]) => {
  return colorScheme[index % colorScheme.length];
};

/**
 * AssetAllocation component for visualizing portfolio asset allocation
 */
export function AssetAllocation({
  data,
  amountsMode = false,
  title = "Asset Allocation",
  subtitle,
  showRefresh = false,
  onRefresh,
  isLoading = false,
  compact = false,
  className,
  chartHeight = 300,
  colorScheme = 'default',
}: AssetAllocationProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');
  
  // Get the color scheme array
  const colors = Array.isArray(colorScheme) 
    ? colorScheme 
    : COLOR_SCHEMES[colorScheme as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.default;

  // Get available allocation types
  const allocationTypes = Object.entries(data)
    .filter(([, value]) => value && value.length > 0)
    .map(([key]) => ({
      id: key,
      label: key
        .replace(/^by/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
    }));

  // Custom active shape for PieChart
  const renderActiveShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value 
    } = props;
    
    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#333" className="text-sm font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy} textAnchor="middle" fill="#333" className="text-lg font-bold">
          {amountsMode ? `$${value.toLocaleString()}` : `${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 15}
          fill={fill}
        />
      </g>
    );
  };

  // Event handler for pie segment hover
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Event handler for pie segment leave
  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Customize the tooltip
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="font-bold">{data.name}</p>
          <p>{amountsMode 
            ? `$${data.value.toLocaleString()}`
            : `${(data.value).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn(compact && "p-4")}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className={cn(compact && "text-lg")}>{title}</CardTitle>
            {subtitle && (
              <CardDescription>{subtitle}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Chart type toggle */}
            <div className="bg-muted rounded-md p-0.5 flex">
              <Button
                variant={viewType === 'pie' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType('pie')}
                className="h-8 px-2"
              >
                <Icon name="PieChart" className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === 'bar' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType('bar')}
                className="h-8 px-2"
              >
                <Icon name="BarChart2" className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Refresh button */}
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

      <CardContent className={cn(compact && "p-4 pt-0")}>
        {/* Display tabs for different allocation types */}
        <Tabs defaultValue={allocationTypes[0]?.id}>
          <TabsList className="w-full">
            {allocationTypes.map((type) => (
              <TabsTrigger 
                key={type.id} 
                value={type.id}
                className={compact ? "py-1 text-xs" : ""}
              >
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Content for each allocation type */}
          {allocationTypes.map((type) => {
            const allocationData = data[type.id as keyof AllocationData] as AllocationItem[];
            
            return (
              <TabsContent key={type.id} value={type.id} className="pt-4">
                <div className="h-full">
                  {viewType === 'pie' ? (
                    <ResponsiveContainer width="100%" height={chartHeight}>
                      <PieChart>
                        <Pie
                          activeIndex={activeIndex}
                          activeShape={renderActiveShape}
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={1}
                          dataKey="value"
                          onMouseEnter={onPieEnter}
                          onMouseLeave={onPieLeave}
                        >
                          {allocationData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color || getColor(index, colors)} 
                            />
                          ))}
                        </Pie>
                        <Tooltip content={customTooltip} />
                        <Legend 
                          formatter={(value) => <span className="text-sm">{value}</span>}
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height={chartHeight}>
                      <BarChart
                        data={allocationData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <XAxis type="number" tickFormatter={(val) => amountsMode ? `$${val}` : `${val}%`} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip 
                          formatter={(value: number) => [
                            amountsMode ? `$${value.toLocaleString()}` : `${value}%`, 
                            'Value'
                          ]}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {allocationData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color || getColor(index, colors)} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Usage example:
 * 
 * const allocationData: AllocationData = {
 *   byAssetClass: [
 *     { name: "Stocks", value: 65 },
 *     { name: "Bonds", value: 25 },
 *     { name: "Cash", value: 5 },
 *     { name: "Alternative", value: 5 }
 *   ],
 *   bySector: [
 *     { name: "Technology", value: 30 },
 *     { name: "Healthcare", value: 15 },
 *     { name: "Financial", value: 12 },
 *     { name: "Consumer", value: 10 },
 *     { name: "Industrial", value: 8 },
 *     { name: "Other", value: 25 }
 *   ],
 *   byGeography: [
 *     { name: "US", value: 60 },
 *     { name: "Europe", value: 20 },
 *     { name: "Asia", value: 15 },
 *     { name: "Other", value: 5 }
 *   ]
 * };
 * 
 * <AssetAllocation
 *   data={allocationData}
 *   showRefresh
 *   onRefresh={() => console.log("Refreshing data...")}
 *   colorScheme="blue"
 * />
 */