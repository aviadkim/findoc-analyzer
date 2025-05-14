import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui-library/atoms/Badge";
import { Icon } from "@/components/ui-library/atoms/Icon";
import { DataTable, ColumnDef } from "@/components/ui-library/organisms/DataTable";
import { SearchFilter } from "@/components/ui-library/molecules/SearchFilter";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";

/**
 * Security interface for a portfolio holding
 */
export interface Security {
  /** Unique identifier */
  id: string;
  /** Security name */
  name: string;
  /** International Securities Identification Number */
  isin?: string;
  /** Ticker symbol */
  ticker?: string;
  /** Asset class */
  assetClass?: string;
  /** Sector */
  sector?: string;
  /** Geography/Country */
  geography?: string;
  /** Currency */
  currency?: string;
  /** Number of shares/units held */
  quantity?: number;
  /** Current price per share/unit */
  price?: number;
  /** Total value (price * quantity) */
  value: number;
  /** Portfolio weight (percentage) */
  weight: number;
  /** Gain/loss amount */
  gainLoss?: number;
  /** Gain/loss percentage */
  gainLossPercent?: number;
  /** Purchase date */
  purchaseDate?: string;
  /** Market status (Market: Active, After-Hours, etc.) */
  marketStatus?: string;
  /** Yield percentage */
  yield?: number;
  /** Risk rating (e.g., 1-5, low-high) */
  riskRating?: number | string;
  /** Additional custom metadata */
  [key: string]: any;
}

/**
 * Props for SecuritiesTable component
 */
interface SecuritiesTableProps {
  /** Securities data */
  securities: Security[];
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
  /** Optional CSS class names */
  className?: string;
  /** Callback for row click */
  onSecurityClick?: (security: Security) => void;
  /** Whether to allow selection of securities */
  selectable?: boolean;
  /** Callback for selection change */
  onSelectionChange?: (selected: Security[]) => void;
  /** Additional actions to display */
  actions?: React.ReactNode;
  /** Whether to enable export functionality */
  enableExport?: boolean;
  /** Callback for exporting data */
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  /** Custom columns configuration (if not provided, default columns will be used) */
  customColumns?: ColumnDef<Security>[];
  /** Default page size */
  defaultPageSize?: number;
  /** Optional maximum height for the table */
  maxHeight?: string;
}

/**
 * SecuritiesTable component for displaying and managing securities portfolio
 */
export function SecuritiesTable({
  securities,
  compact = false,
  title = "Portfolio Holdings",
  subtitle,
  showRefresh = false,
  onRefresh,
  isLoading = false,
  footer,
  className,
  onSecurityClick,
  selectable = false,
  onSelectionChange,
  actions,
  enableExport = false,
  onExport,
  customColumns,
  defaultPageSize = 10,
  maxHeight,
}: SecuritiesTableProps) {
  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: "",
    assetClass: "",
    sector: "",
    geography: "",
  });

  // Define default columns if custom columns are not provided
  const defaultColumns: ColumnDef<Security>[] = [
    {
      id: 'name',
      header: 'Security',
      accessor: (row) => row.name,
      cell: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">
            {row.ticker ? row.ticker : ''}{row.ticker && row.isin ? ' | ' : ''}{row.isin ? row.isin : ''}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'assetClass',
      header: 'Asset Class',
      accessor: (row) => row.assetClass || 'Unknown',
      cell: (value) => (
        <Badge variant="secondary" className="font-normal">
          {value}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: 'quantity',
      header: 'Quantity',
      accessor: (row) => row.quantity || 0,
      cell: (value) => value.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      sortable: true,
      rightAlign: true,
    },
    {
      id: 'price',
      header: 'Price',
      accessor: (row) => row.price || 0,
      cell: (value, row) => formatCurrency(value, { currency: row.currency }),
      sortable: true,
      rightAlign: true,
    },
    {
      id: 'value',
      header: 'Value',
      accessor: (row) => row.value,
      cell: (value, row) => formatCurrency(value, { currency: row.currency }),
      sortable: true,
      rightAlign: true,
    },
    {
      id: 'weight',
      header: 'Weight',
      accessor: (row) => row.weight,
      cell: (value) => formatPercentage(value),
      sortable: true,
      rightAlign: true,
    },
    {
      id: 'gainLoss',
      header: 'Gain/Loss',
      accessor: (row) => row.gainLoss || 0,
      cell: (value, row) => (
        <div className={value >= 0 ? 'text-green-500' : 'text-red-500'}>
          <div>{formatCurrency(value, { currency: row.currency })}</div>
          <div className="text-xs">
            {row.gainLossPercent !== undefined ? formatPercentage(row.gainLossPercent) : ''}
          </div>
        </div>
      ),
      sortable: true,
      rightAlign: true,
    },
  ];

  // Use custom columns if provided, otherwise use default columns
  const columns = customColumns || defaultColumns;

  // Build filter options from securities data
  const filterGroups = [
    {
      id: 'assetClass',
      label: 'Asset Class',
      options: Array.from(new Set(securities.map(s => s.assetClass).filter(Boolean)))
        .map(value => ({
          id: value as string,
          label: value as string,
          value: value as string,
        }))
    },
    {
      id: 'sector',
      label: 'Sector',
      options: Array.from(new Set(securities.map(s => s.sector).filter(Boolean)))
        .map(value => ({
          id: value as string,
          label: value as string,
          value: value as string,
        }))
    },
    {
      id: 'geography',
      label: 'Geography',
      options: Array.from(new Set(securities.map(s => s.geography).filter(Boolean)))
        .map(value => ({
          id: value as string,
          label: value as string,
          value: value as string,
        }))
    },
  ];

  // Apply filters to securities
  const filteredSecurities = securities.filter(security => {
    // Search term filter
    if (filters.searchTerm && !security.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
        !security.ticker?.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
        !security.isin?.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Asset class filter
    if (filters.assetClass && security.assetClass !== filters.assetClass) {
      return false;
    }
    
    // Sector filter
    if (filters.sector && security.sector !== filters.sector) {
      return false;
    }
    
    // Geography filter
    if (filters.geography && security.geography !== filters.geography) {
      return false;
    }
    
    return true;
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Handle export button click
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (onExport) {
      onExport(format);
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn(compact && "p-4")}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className={cn(compact && "text-lg")}>{title}</CardTitle>
            {subtitle && (
              <CardDescription>{subtitle}</CardDescription>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            
            {/* Export menu */}
            {enableExport && onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size={compact ? "sm" : "default"}>
                    <Icon name="Download" className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <Icon name="FileText" className="mr-2 h-4 w-4" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <Icon name="FileSpreadsheet" className="mr-2 h-4 w-4" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <Icon name="FilePdf" className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Refresh button */}
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
        {/* Search and filters */}
        <div className="mb-4">
          <SearchFilter
            searchPlaceholder="Search by name, ticker, or ISIN..."
            searchTerm={filters.searchTerm}
            onSearchChange={(term) => handleFilterChange({ searchTerm: term })}
            filterGroups={filterGroups}
            onFilterChange={handleFilterChange}
            compact={compact}
          />
        </div>
        
        {/* Securities table */}
        <DataTable
          columns={columns}
          data={filteredSecurities}
          getRowKey={(row) => row.id}
          onRowClick={onSecurityClick}
          isLoading={isLoading}
          emptyMessage="No securities found"
          pagination
          defaultPageSize={defaultPageSize}
          sortable
          defaultSort={{ column: 'value', direction: 'desc' }}
          selectable={selectable}
          onSelectionChange={onSelectionChange}
          maxHeight={maxHeight}
          compact={compact}
        />
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
 * const securitiesData: Security[] = [
 *   {
 *     id: "1",
 *     name: "Apple Inc.",
 *     ticker: "AAPL",
 *     isin: "US0378331005",
 *     assetClass: "Equity",
 *     sector: "Technology",
 *     geography: "US",
 *     currency: "USD",
 *     quantity: 100,
 *     price: 180.75,
 *     value: 18075,
 *     weight: 15.2,
 *     gainLoss: 5200,
 *     gainLossPercent: 40.35,
 *     yield: 0.5,
 *     riskRating: "Medium"
 *   },
 *   {
 *     id: "2",
 *     name: "Microsoft Corporation",
 *     ticker: "MSFT",
 *     isin: "US5949181045",
 *     assetClass: "Equity",
 *     sector: "Technology",
 *     geography: "US",
 *     currency: "USD",
 *     quantity: 50,
 *     price: 340.25,
 *     value: 17012.50,
 *     weight: 14.3,
 *     gainLoss: 4250,
 *     gainLossPercent: 33.28,
 *     yield: 0.8,
 *     riskRating: "Medium"
 *   },
 *   // More securities...
 * ];
 * 
 * <SecuritiesTable
 *   securities={securitiesData}
 *   showRefresh
 *   onRefresh={() => console.log("Refreshing data...")}
 *   onSecurityClick={(security) => console.log("Clicked:", security)}
 *   enableExport
 *   onExport={(format) => console.log(`Exporting as ${format}...`)}
 *   footer={
 *     <div className="text-sm text-muted-foreground">
 *       Total Holdings: {securitiesData.length} | Total Value: {formatCurrency(118750)}
 *     </div>
 *   }
 * />
 */