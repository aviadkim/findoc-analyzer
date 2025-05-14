import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui-library/atoms/Badge";
import { Icon } from "@/components/ui-library/atoms/Icon";
import { Typography, Heading3, Paragraph, MutedText } from "@/components/ui-library/atoms/Typography";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";

/**
 * Financial figure interface
 */
export interface FinancialFigure {
  /** Name of the figure (e.g., "Total Assets") */
  name: string;
  /** Value of the figure */
  value: number | string;
  /** Optional currency */
  currency?: string;
  /** Optional context or description */
  context?: string;
  /** Optional change percentage */
  changePercent?: number;
  /** Optional category for grouping */
  category?: string;
}

/**
 * Financial metric interface
 */
export interface FinancialMetric {
  /** Label of the metric (e.g., "Return on Equity") */
  label: string;
  /** Value of the metric */
  value: number | string;
  /** Optional context or description */
  context?: string;
  /** Optional benchmark value */
  benchmark?: number | string;
  /** Optional indicator if metric is good/bad/neutral */
  status?: 'positive' | 'negative' | 'neutral';
}

/**
 * Financial statement line item interface
 */
export interface StatementLineItem {
  /** Label of the line item */
  label: string;
  /** Value of the line item */
  value: number | string;
  /** Optional sub-items */
  items?: StatementLineItem[];
}

/**
 * Financial statement interface
 */
export interface FinancialStatement {
  /** Statement period (e.g., "Q1 2025", "FY 2024") */
  period: string;
  /** Line items in the statement */
  lineItems: StatementLineItem[];
}

/**
 * Financial insight interface
 */
export interface FinancialInsight {
  /** Topic of the insight */
  topic: string;
  /** The actual insight text */
  insight: string;
  /** Optional importance level */
  importance?: 'high' | 'medium' | 'low';
}

/**
 * Document analytics data interface
 */
export interface DocumentAnalyticsData {
  /** Document type (e.g., "Annual Report", "Portfolio Statement") */
  documentType: string;
  /** Summary of the document */
  summary?: string;
  /** Document period or date */
  period?: string;
  /** Extracted financial figures */
  financialFigures?: FinancialFigure[];
  /** Financial metrics grouped by category */
  financialMetrics?: {
    profitability?: FinancialMetric[];
    liquidity?: FinancialMetric[];
    solvency?: FinancialMetric[];
    valuation?: FinancialMetric[];
    growth?: FinancialMetric[];
    efficiency?: FinancialMetric[];
    [key: string]: FinancialMetric[] | undefined;
  };
  /** Financial statements */
  financialStatements?: {
    incomeStatement?: FinancialStatement;
    balanceSheet?: FinancialStatement;
    cashFlow?: FinancialStatement;
    [key: string]: FinancialStatement | undefined;
  };
  /** Key insights extracted from the document */
  insights?: FinancialInsight[];
  /** Performance data over time */
  performanceData?: {
    label: string;
    value: number;
    date: string;
  }[];
  /** Comparison data */
  comparisonData?: {
    label: string;
    actual: number;
    benchmark: number;
  }[];
}

/**
 * Props for DocumentAnalytics component
 */
interface DocumentAnalyticsProps {
  /** Document analytics data */
  data: DocumentAnalyticsData;
  /** Whether to use a compact layout */
  compact?: boolean;
  /** Optional title override */
  title?: string;
  /** Optional document name to display */
  documentName?: string;
  /** Whether to show a refresh button */
  showRefresh?: boolean;
  /** Callback for refresh button */
  onRefresh?: () => void;
  /** Whether the data is currently loading */
  isLoading?: boolean;
  /** Optional CSS class names */
  className?: string;
  /** Optional export button functionality */
  onExport?: () => void;
  /** Optional callback for when a user wants to view the original document */
  onViewOriginal?: () => void;
}

/**
 * DocumentAnalytics component for displaying financial document analysis
 */
export function DocumentAnalytics({
  data,
  compact = false,
  title,
  documentName,
  showRefresh = false,
  onRefresh,
  isLoading = false,
  className,
  onExport,
  onViewOriginal,
}: DocumentAnalyticsProps) {
  // Helper to determine badge color for insights
  const getImportanceBadge = (importance?: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high':
        return <Badge variant="destructive">High Importance</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Importance</Badge>;
      case 'low':
        return <Badge>For Information</Badge>;
      default:
        return null;
    }
  };

  // Format value based on type
  const formatValue = (value: number | string, currency?: string) => {
    if (typeof value === 'number') {
      return currency 
        ? formatCurrency(value, { currency }) 
        : value.toLocaleString();
    }
    return value;
  };

  // Helper to format metric values
  const formatMetricValue = (value: number | string) => {
    if (typeof value === 'number') {
      // Check if it's a percentage (typically between 0-1 or -1-1 for ratios)
      if (Math.abs(value) <= 1) {
        return formatPercentage(value * 100);
      } else {
        return value.toLocaleString();
      }
    }
    return value;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn(compact && "p-4")}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={cn(compact && "text-lg")}>
              {title || `${data.documentType} Analysis`}
            </CardTitle>
            {documentName && (
              <CardDescription className={cn(compact && "text-xs")}>
                {documentName} {data.period ? `(${data.period})` : ''}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onViewOriginal && (
              <Button 
                variant="outline" 
                size={compact ? "sm" : "default"}
                onClick={onViewOriginal}
              >
                <Icon name="FileText" className="mr-2 h-4 w-4" />
                View Original
              </Button>
            )}
            
            {onExport && (
              <Button 
                variant="outline" 
                size={compact ? "sm" : "default"}
                onClick={onExport}
              >
                <Icon name="Download" className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
            
            {showRefresh && onRefresh && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onRefresh}
                disabled={isLoading}
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
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className={cn("grid w-full", getTabsGridClass())}>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            {data.financialFigures && data.financialFigures.length > 0 && (
              <TabsTrigger value="figures">Key Figures</TabsTrigger>
            )}
            {data.financialMetrics && Object.values(data.financialMetrics).some(metrics => metrics && metrics.length > 0) && (
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            )}
            {data.financialStatements && Object.values(data.financialStatements).some(statement => statement && statement.lineItems.length > 0) && (
              <TabsTrigger value="statements">Statements</TabsTrigger>
            )}
            {(data.performanceData || data.comparisonData) && (
              <TabsTrigger value="charts">Charts</TabsTrigger>
            )}
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="pt-4 space-y-6">
            {data.summary && (
              <div className="space-y-4">
                <Heading3>Document Summary</Heading3>
                <Paragraph>{data.summary}</Paragraph>
              </div>
            )}
            
            {data.insights && data.insights.length > 0 && (
              <div className="space-y-4">
                <Heading3>Key Insights</Heading3>
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  {data.insights.map((insight, index) => (
                    <Card key={index} className={cn(compact && "p-0")}>
                      <CardHeader className={cn(compact && "p-3")}>
                        <div className="flex justify-between items-start">
                          <CardTitle className={cn("text-base", compact && "text-sm")}>
                            {insight.topic}
                          </CardTitle>
                          {getImportanceBadge(insight.importance)}
                        </div>
                      </CardHeader>
                      <CardContent className={cn(compact && "p-3 pt-0")}>
                        <Paragraph>{insight.insight}</Paragraph>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Key Figures Tab */}
          {data.financialFigures && data.financialFigures.length > 0 && (
            <TabsContent value="figures" className="pt-4">
              <div className="space-y-4">
                <Heading3>Key Financial Figures</Heading3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Figure</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Context</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.financialFigures.map((figure, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {figure.name}
                          </TableCell>
                          <TableCell>
                            {formatValue(figure.value, figure.currency)}
                          </TableCell>
                          <TableCell>
                            {figure.changePercent !== undefined && (
                              <span className={cn(
                                figure.changePercent > 0 
                                  ? "text-green-500" 
                                  : figure.changePercent < 0 
                                    ? "text-red-500" 
                                    : ""
                              )}>
                                {figure.changePercent > 0 ? "+" : ""}
                                {formatPercentage(figure.changePercent)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {figure.context}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Metrics Tab */}
          {data.financialMetrics && Object.values(data.financialMetrics).some(metrics => metrics && metrics.length > 0) && (
            <TabsContent value="metrics" className="pt-4">
              <div className="space-y-4">
                <Heading3>Financial Metrics</Heading3>
                <Tabs defaultValue={getDefaultMetricCategory()}>
                  <TabsList className="w-full">
                    {Object.entries(data.financialMetrics)
                      .filter(([, metrics]) => metrics && metrics.length > 0)
                      .map(([category]) => (
                        <TabsTrigger key={category} value={category}>
                          {formatCategoryName(category)}
                        </TabsTrigger>
                      ))}
                  </TabsList>
                  
                  {Object.entries(data.financialMetrics)
                    .filter(([, metrics]) => metrics && metrics.length > 0)
                    .map(([category, metrics]) => (
                      <TabsContent key={category} value={category} className="pt-4">
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Metric</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Benchmark</TableHead>
                                <TableHead>Context</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {metrics && metrics.map((metric, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {metric.label}
                                  </TableCell>
                                  <TableCell className={cn(
                                    metric.status === 'positive' 
                                      ? "text-green-500" 
                                      : metric.status === 'negative' 
                                        ? "text-red-500" 
                                        : ""
                                  )}>
                                    {formatMetricValue(metric.value)}
                                  </TableCell>
                                  <TableCell>
                                    {metric.benchmark !== undefined 
                                      ? formatMetricValue(metric.benchmark) 
                                      : "-"}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {metric.context}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    ))}
                </Tabs>
              </div>
            </TabsContent>
          )}

          {/* Statements Tab */}
          {data.financialStatements && Object.values(data.financialStatements).some(statement => statement && statement.lineItems.length > 0) && (
            <TabsContent value="statements" className="pt-4">
              <div className="space-y-4">
                <Heading3>Financial Statements</Heading3>
                <Tabs defaultValue={getDefaultStatementType()}>
                  <TabsList className="w-full">
                    {Object.entries(data.financialStatements)
                      .filter(([, statement]) => statement && statement.lineItems.length > 0)
                      .map(([type]) => (
                        <TabsTrigger key={type} value={type}>
                          {formatStatementName(type)}
                        </TabsTrigger>
                      ))}
                  </TabsList>
                  
                  {Object.entries(data.financialStatements)
                    .filter(([, statement]) => statement && statement.lineItems.length > 0)
                    .map(([type, statement]) => (
                      <TabsContent key={type} value={type} className="pt-4">
                        {statement && (
                          <>
                            <MutedText as="div" className="mb-2">
                              Period: {statement.period}
                            </MutedText>
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {renderStatementLineItems(statement.lineItems)}
                                </TableBody>
                              </Table>
                            </div>
                          </>
                        )}
                      </TabsContent>
                    ))}
                </Tabs>
              </div>
            </TabsContent>
          )}

          {/* Charts Tab */}
          {(data.performanceData || data.comparisonData) && (
            <TabsContent value="charts" className="pt-4">
              <div className="space-y-8">
                {data.performanceData && data.performanceData.length > 0 && (
                  <div>
                    <Heading3 className="mb-4">Performance Trend</Heading3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={data.performanceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name={data.performanceData[0]?.label || "Value"} 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {data.comparisonData && data.comparisonData.length > 0 && (
                  <div>
                    <Heading3 className="mb-4">Comparative Analysis</Heading3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={data.comparisonData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="actual" name="Actual" fill="#8884d8" />
                        <Bar dataKey="benchmark" name="Benchmark" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
  
  // Helper function to get appropriate grid class for tabs
  function getTabsGridClass() {
    let count = 1; // Summary tab is always present
    
    if (data.financialFigures && data.financialFigures.length > 0) count++;
    if (data.financialMetrics && Object.values(data.financialMetrics).some(metrics => metrics && metrics.length > 0)) count++;
    if (data.financialStatements && Object.values(data.financialStatements).some(statement => statement && statement.lineItems.length > 0)) count++;
    if (data.performanceData || data.comparisonData) count++;
    
    return `grid-cols-${count}`;
  }
  
  // Helper function to get default metric category
  function getDefaultMetricCategory() {
    const categories = Object.entries(data.financialMetrics || {})
      .filter(([, metrics]) => metrics && metrics.length > 0)
      .map(([category]) => category);
    
    return categories[0] || '';
  }
  
  // Helper function to get default statement type
  function getDefaultStatementType() {
    const types = Object.entries(data.financialStatements || {})
      .filter(([, statement]) => statement && statement.lineItems.length > 0)
      .map(([type]) => type);
    
    return types[0] || '';
  }
  
  // Helper to format category name for display
  function formatCategoryName(category: string) {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
  }
  
  // Helper to format statement name for display
  function formatStatementName(type: string) {
    switch (type) {
      case 'incomeStatement':
        return 'Income Statement';
      case 'balanceSheet':
        return 'Balance Sheet';
      case 'cashFlow':
        return 'Cash Flow';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
    }
  }
  
  // Helper to render nested statement line items
  function renderStatementLineItems(lineItems: StatementLineItem[], level = 0) {
    return lineItems.map((item, index) => (
      <React.Fragment key={`${item.label}-${index}`}>
        <TableRow>
          <TableCell className={cn(
            "font-medium",
            level > 0 && "pl-" + (level * 4)
          )}>
            {item.label}
          </TableCell>
          <TableCell className="text-right">
            {formatValue(item.value)}
          </TableCell>
        </TableRow>
        {item.items && item.items.length > 0 && renderStatementLineItems(item.items, level + 1)}
      </React.Fragment>
    ));
  }
}

/**
 * Usage example:
 * 
 * const documentAnalyticsData: DocumentAnalyticsData = {
 *   documentType: "Annual Report",
 *   summary: "The 2024 annual report shows strong performance with revenue growth of 12% and a 15% increase in net profit compared to the previous year. The company maintains a healthy balance sheet with increased cash reserves and reduced debt.",
 *   period: "FY 2024",
 *   financialFigures: [
 *     {
 *       name: "Revenue",
 *       value: 1250000000,
 *       currency: "USD",
 *       changePercent: 12,
 *       context: "Year-over-year growth of 12%"
 *     },
 *     {
 *       name: "Net Income",
 *       value: 320000000,
 *       currency: "USD",
 *       changePercent: 15,
 *       context: "Profit margin of 25.6%"
 *     },
 *     {
 *       name: "Total Assets",
 *       value: 2850000000,
 *       currency: "USD",
 *       changePercent: 8.5,
 *       context: "Increase primarily due to business acquisitions"
 *     }
 *   ],
 *   financialMetrics: {
 *     profitability: [
 *       {
 *         label: "Gross Margin",
 *         value: 0.62,
 *         benchmark: 0.58,
 *         status: "positive",
 *         context: "Above industry average of 58%"
 *       },
 *       {
 *         label: "Return on Equity",
 *         value: 0.21,
 *         benchmark: 0.18,
 *         status: "positive",
 *         context: "Improved from 18% last year"
 *       }
 *     ],
 *     liquidity: [
 *       {
 *         label: "Current Ratio",
 *         value: 2.1,
 *         benchmark: 1.5,
 *         status: "positive",
 *         context: "Healthy short-term liquidity"
 *       }
 *     ]
 *   },
 *   financialStatements: {
 *     incomeStatement: {
 *       period: "Jan 1, 2024 - Dec 31, 2024",
 *       lineItems: [
 *         {
 *           label: "Revenue",
 *           value: 1250000000
 *         },
 *         {
 *           label: "Cost of Revenue",
 *           value: 475000000
 *         },
 *         {
 *           label: "Gross Profit",
 *           value: 775000000
 *         },
 *         {
 *           label: "Operating Expenses",
 *           value: 375000000,
 *           items: [
 *             {
 *               label: "Research & Development",
 *               value: 150000000
 *             },
 *             {
 *               label: "Sales & Marketing",
 *               value: 175000000
 *             },
 *             {
 *               label: "General & Administrative",
 *               value: 50000000
 *             }
 *           ]
 *         },
 *         {
 *           label: "Operating Income",
 *           value: 400000000
 *         },
 *         {
 *           label: "Net Income",
 *           value: 320000000
 *         }
 *       ]
 *     }
 *   },
 *   insights: [
 *     {
 *       topic: "Revenue Growth",
 *       insight: "The company's 12% revenue growth outperforms the industry average of 8%, driven primarily by expansion in the Asia-Pacific region and new product introductions.",
 *       importance: "high"
 *     },
 *     {
 *       topic: "Research & Development",
 *       insight: "R&D spending increased by 25%, indicating a strategic focus on innovation and future product development.",
 *       importance: "medium"
 *     },
 *     {
 *       topic: "Debt Reduction",
 *       insight: "The company reduced its long-term debt by 15%, improving its debt-to-equity ratio from 0.5 to 0.4.",
 *       importance: "medium"
 *     }
 *   ],
 *   performanceData: [
 *     { label: "Revenue", value: 950000000, date: "2021" },
 *     { label: "Revenue", value: 1050000000, date: "2022" },
 *     { label: "Revenue", value: 1120000000, date: "2023" },
 *     { label: "Revenue", value: 1250000000, date: "2024" }
 *   ],
 *   comparisonData: [
 *     { label: "Revenue Growth", actual: 12, benchmark: 8 },
 *     { label: "Profit Margin", actual: 25.6, benchmark: 22 },
 *     { label: "ROE", actual: 21, benchmark: 18 },
 *     { label: "Debt/Equity", actual: 0.4, benchmark: 0.6 }
 *   ]
 * };
 * 
 * <DocumentAnalytics
 *   data={documentAnalyticsData}
 *   documentName="XYZ Corp Annual Report"
 *   showRefresh
 *   onRefresh={() => console.log("Refreshing analysis...")}
 *   onExport={() => console.log("Exporting analysis...")}
 *   onViewOriginal={() => console.log("Viewing original document...")}
 * />
 */