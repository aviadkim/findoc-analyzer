import React, { useState, useMemo } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Icon } from "@/components/ui-library/atoms/Icon";
import { SearchFilter } from "@/components/ui-library/molecules/SearchFilter";
import { cn } from "@/lib/utils";

/**
 * Column definition type
 */
export interface ColumnDef<T> {
  /** Unique identifier for the column */
  id: string;
  /** Header title */
  header: string;
  /** Accessor function to get the value from a row */
  accessor: (row: T) => any;
  /** Optional cell renderer function */
  cell?: (value: any, row: T) => React.ReactNode;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Whether to right-align this column (good for numbers) */
  rightAlign?: boolean;
  /** Custom width for this column (e.g., '120px', '10%') */
  width?: string;
  /** Column visibility - set to false to hide by default */
  visible?: boolean;
}

/**
 * Sort direction type
 */
type SortDirection = 'asc' | 'desc';

/**
 * Sort state type
 */
interface SortState {
  column: string;
  direction: SortDirection;
}

/**
 * Props for the DataTable component
 */
interface DataTableProps<T> {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Data to display in the table */
  data: T[];
  /** Optional key function to generate unique keys for rows */
  getRowKey?: (row: T) => string | number;
  /** Optional row click handler */
  onRowClick?: (row: T) => void;
  /** Optional loading state */
  isLoading?: boolean;
  /** Optional empty state message */
  emptyMessage?: string;
  /** Whether to enable pagination */
  pagination?: boolean;
  /** Default page size (default: 10) */
  defaultPageSize?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Whether to enable sorting */
  sortable?: boolean;
  /** Default sort column and direction */
  defaultSort?: SortState;
  /** Whether to enable filtering */
  filterable?: boolean;
  /** Whether to enable selection of rows */
  selectable?: boolean;
  /** Maximum height for the table body (e.g., '400px') */
  maxHeight?: string;
  /** Additional CSS class name */
  className?: string;
  /** Optional caption for the table */
  caption?: string;
  /** Optional actions to display above the table */
  actions?: React.ReactNode;
  /** Whether to use a compact layout */
  compact?: boolean;
  /** Function to call when sort changes */
  onSortChange?: (sort: SortState) => void;
  /** Function to call when selection changes */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Function for client-side filtering - server-side should use its own filtering */
  onFilterChange?: (filters: any) => void;
  /** Function for client-side pagination - server-side should handle this */
  onPageChange?: (page: number, pageSize: number) => void;
}

/**
 * DataTable component with sorting, pagination, and filtering
 */
export function DataTable<T>({
  columns,
  data,
  getRowKey = (row, index) => index,
  onRowClick,
  isLoading = false,
  emptyMessage = "No data available",
  pagination = false,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  sortable = false,
  defaultSort,
  filterable = false,
  selectable = false,
  maxHeight,
  className,
  caption,
  actions,
  compact = false,
  onSortChange,
  onSelectionChange,
  onFilterChange,
  onPageChange,
}: DataTableProps<T>) {
  // State for sorting
  const [sort, setSort] = useState<SortState | undefined>(defaultSort);
  
  // State for pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  
  // State for selection
  const [selectedRows, setSelectedRows] = useState<Record<string | number, boolean>>({});
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState("");
  
  // Function to handle sort changes
  const handleSort = (columnId: string) => {
    if (!sortable) return;
    
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;
    
    let direction: SortDirection = 'asc';
    
    if (sort?.column === columnId) {
      if (sort.direction === 'asc') {
        direction = 'desc';
      } else {
        // Clear sort if already desc
        setSort(undefined);
        if (onSortChange) onSortChange({ column: "", direction: 'asc' });
        return;
      }
    }
    
    const newSort = { column: columnId, direction };
    setSort(newSort);
    
    if (onSortChange) {
      onSortChange(newSort);
    }
  };
  
  // Apply sorting to data (client-side sorting)
  const sortedData = useMemo(() => {
    if (!sortable || !sort || !sort.column || onSortChange) {
      return data;
    }
    
    const column = columns.find(col => col.id === sort.column);
    if (!column) return data;
    
    return [...data].sort((a, b) => {
      const valueA = column.accessor(a);
      const valueB = column.accessor(b);
      
      if (valueA === valueB) return 0;
      
      const comparison = valueA < valueB ? -1 : 1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sort, sortable, columns, onSortChange]);
  
  // Apply pagination to data (client-side pagination)
  const paginatedData = useMemo(() => {
    if (!pagination || onPageChange) {
      return sortedData;
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return sortedData.slice(start, end);
  }, [sortedData, pagination, page, pageSize, onPageChange]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.ceil(data.length / pageSize);
  }, [data.length, pageSize, pagination]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
    if (onPageChange) {
      onPageChange(newPage, pageSize);
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (newPageSizeStr: string) => {
    const newPageSize = parseInt(newPageSizeStr, 10);
    setPageSize(newPageSize);
    setPage(1); // Reset to first page
    
    if (onPageChange) {
      onPageChange(1, newPageSize);
    }
  };
  
  // Handle row selection
  const handleRowSelect = (row: T, isSelected: boolean) => {
    const key = getRowKey(row);
    
    const newSelectedRows = {
      ...selectedRows,
      [key]: isSelected,
    };
    
    setSelectedRows(newSelectedRows);
    
    if (onSelectionChange) {
      const selected = data.filter(row => newSelectedRows[getRowKey(row)]);
      onSelectionChange(selected);
    }
  };
  
  // Handle select all rows
  const handleSelectAll = (isSelected: boolean) => {
    const newSelectedRows: Record<string | number, boolean> = {};
    
    if (isSelected) {
      paginatedData.forEach(row => {
        newSelectedRows[getRowKey(row)] = true;
      });
    }
    
    setSelectedRows(newSelectedRows);
    
    if (onSelectionChange) {
      const selected = isSelected ? paginatedData : [];
      onSelectionChange(selected);
    }
  };
  
  // Calculate if all rows on current page are selected
  const allSelected = paginatedData.length > 0 && 
    paginatedData.every(row => selectedRows[getRowKey(row)]);
  
  // Calculate if some rows on current page are selected
  const someSelected = !allSelected && 
    paginatedData.some(row => selectedRows[getRowKey(row)]);
  
  // Handle search term change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page
    
    if (onFilterChange) {
      onFilterChange({ searchTerm: term });
    }
  };
  
  // Visible columns (respecting the visible property)
  const visibleColumns = columns.filter(col => col.visible !== false);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table toolbar */}
      {(filterable || actions) && (
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          {filterable && (
            <div className="sm:w-1/2">
              <SearchFilter
                searchPlaceholder="Search..."
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                compact={compact}
              />
            </div>
          )}
          
          {actions && (
            <div className="flex justify-end sm:w-1/2 gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Table */}
      <div className={cn(
        "rounded-md border",
        maxHeight && "overflow-y-auto"
      )} style={{ maxHeight }}>
        <Table>
          {caption && <caption className="text-sm text-muted-foreground mt-4">{caption}</caption>}
          
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              {/* Selection checkbox column */}
              {selectable && (
                <TableHead className="w-[40px] text-center">
                  <div className="flex justify-center items-center h-full">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={allSelected}
                      ref={input => {
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </div>
                </TableHead>
              )}
              
              {/* Data columns */}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.rightAlign && "text-right",
                    column.sortable && sortable && "cursor-pointer select-none",
                    compact && "py-2"
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && sortable && handleSort(column.id)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sortable && sort?.column === column.id && (
                      <Icon 
                        name={sort.direction === 'asc' ? 'ArrowUp' : 'ArrowDown'} 
                        size={16} 
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center">
                    <Icon name="Loader" className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Icon name="FileX" className="h-8 w-8 mb-2" />
                    <span>{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => {
                const rowKey = getRowKey(row);
                
                return (
                  <TableRow
                    key={rowKey}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      selectedRows[rowKey] && "bg-primary/5"
                    )}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {/* Selection checkbox */}
                    {selectable && (
                      <TableCell className="text-center">
                        <div
                          className="flex justify-center items-center h-full"
                          onClick={(e) => e.stopPropagation()} // Prevent row click
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={!!selectedRows[rowKey]}
                            onChange={(e) => handleRowSelect(row, e.target.checked)}
                          />
                        </div>
                      </TableCell>
                    )}
                    
                    {/* Data cells */}
                    {visibleColumns.map((column) => {
                      const value = column.accessor(row);
                      
                      return (
                        <TableCell
                          key={`${rowKey}-${column.id}`}
                          className={cn(
                            column.rightAlign && "text-right",
                            compact && "py-2"
                          )}
                        >
                          {column.cell ? column.cell(value, row) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground mr-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <Icon name="ChevronsLeft" className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <Icon name="ChevronLeft" className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <Icon name="ChevronRight" className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <Icon name="ChevronsRight" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Usage example:
 * 
 * // Define columns
 * const columns: ColumnDef<Security>[] = [
 *   {
 *     id: 'security',
 *     header: 'Security',
 *     accessor: (row) => row.name,
 *     cell: (value, row) => (
 *       <div>
 *         <div className="font-medium">{value}</div>
 *         <div className="text-xs text-muted-foreground">{row.isin}</div>
 *       </div>
 *     ),
 *     sortable: true,
 *   },
 *   {
 *     id: 'assetClass',
 *     header: 'Asset Class',
 *     accessor: (row) => row.assetClass,
 *     sortable: true,
 *   },
 *   {
 *     id: 'value',
 *     header: 'Value',
 *     accessor: (row) => row.value,
 *     cell: (value) => formatCurrency(value),
 *     sortable: true,
 *     rightAlign: true,
 *   },
 *   {
 *     id: 'gainLoss',
 *     header: 'Gain/Loss',
 *     accessor: (row) => row.gainLoss,
 *     cell: (value) => (
 *       <span className={value >= 0 ? 'text-green-500' : 'text-red-500'}>
 *         {formatCurrency(value)}
 *       </span>
 *     ),
 *     sortable: true,
 *     rightAlign: true,
 *   },
 * ];
 * 
 * // Use the component
 * <DataTable
 *   columns={columns}
 *   data={securities}
 *   getRowKey={(row) => row.id}
 *   pagination
 *   defaultPageSize={10}
 *   sortable
 *   defaultSort={{ column: 'value', direction: 'desc' }}
 *   filterable
 *   onRowClick={(row) => console.log('Clicked row:', row)}
 *   actions={
 *     <Button>
 *       <Icon name="Download" className="mr-2 h-4 w-4" />
 *       Export
 *     </Button>
 *   }
 * />
 */