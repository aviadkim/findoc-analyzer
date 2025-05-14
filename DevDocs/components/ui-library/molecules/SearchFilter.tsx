import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-library/atoms/Badge";
import { Icon } from "@/components/ui-library/atoms/Icon";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Filter option type definition
 */
export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

/**
 * Filter group type definition
 */
export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

/**
 * Active filter type definition
 */
export interface ActiveFilter {
  groupId: string;
  optionId: string;
  label: string;
  value: string;
}

/**
 * Props for the SearchFilter component
 */
interface SearchFilterProps {
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Search term value */
  searchTerm?: string;
  /** Callback when search term changes */
  onSearchChange?: (value: string) => void;
  /** Available filter groups */
  filterGroups?: FilterGroup[];
  /** Currently active filters */
  activeFilters?: ActiveFilter[];
  /** Callback when filters change */
  onFilterChange?: (filters: ActiveFilter[]) => void;
  /** Whether to display in a compact mode */
  compact?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Whether to align controls horizontally (default) or vertically */
  vertical?: boolean;
}

/**
 * SearchFilter component for filtering and searching data
 */
export function SearchFilter({
  searchPlaceholder = "Search...",
  searchTerm = "",
  onSearchChange,
  filterGroups = [],
  activeFilters = [],
  onFilterChange,
  compact = false,
  className,
  vertical = false,
}: SearchFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [localFilters, setLocalFilters] = useState<ActiveFilter[]>(activeFilters);
  const [selectedGroup, setSelectedGroup] = useState<string>(filterGroups[0]?.id || "");
  const [selectedOption, setSelectedOption] = useState<string>("");

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // Handle adding a new filter
  const handleAddFilter = () => {
    if (!selectedGroup || !selectedOption) return;
    
    const group = filterGroups.find(g => g.id === selectedGroup);
    if (!group) return;
    
    const option = group.options.find(o => o.id === selectedOption);
    if (!option) return;
    
    const newFilter: ActiveFilter = {
      groupId: selectedGroup,
      optionId: selectedOption,
      label: `${group.label}: ${option.label}`,
      value: option.value,
    };
    
    const updatedFilters = [...localFilters, newFilter];
    setLocalFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
    
    // Reset selected option
    setSelectedOption("");
  };

  // Handle removing a filter
  const handleRemoveFilter = (filter: ActiveFilter) => {
    const updatedFilters = localFilters.filter(
      f => !(f.groupId === filter.groupId && f.optionId === filter.optionId)
    );
    
    setLocalFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  // Handle clearing all filters
  const handleClearFilters = () => {
    setLocalFilters([]);
    
    if (onFilterChange) {
      onFilterChange([]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn(
        "flex gap-3 flex-wrap",
        vertical ? "flex-col" : "items-center"
      )}>
        {/* Search input */}
        <div className={vertical ? "w-full" : "flex-grow max-w-md"}>
          <div className="relative">
            <Icon 
              name="Search" 
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" 
            />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={handleSearchChange}
              className={cn("pl-8", compact && "h-8 text-sm")}
            />
          </div>
        </div>
        
        {/* Filter controls */}
        {filterGroups.length > 0 && (
          <div className={cn(
            "flex gap-2 flex-wrap",
            vertical ? "w-full" : "items-center"
          )}>
            <Select
              value={selectedGroup}
              onValueChange={setSelectedGroup}
            >
              <SelectTrigger className={cn(compact && "h-8 text-sm")}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filterGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedOption}
              onValueChange={setSelectedOption}
              disabled={!selectedGroup}
            >
              <SelectTrigger className={cn(compact && "h-8 text-sm")}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {selectedGroup &&
                  filterGroups
                    .find(g => g.id === selectedGroup)
                    ?.options.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="secondary"
              size={compact ? "sm" : "default"}
              onClick={handleAddFilter}
              disabled={!selectedGroup || !selectedOption}
            >
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Add Filter
            </Button>
          </div>
        )}
      </div>
      
      {/* Active filters */}
      {localFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {localFilters.map((filter, index) => (
            <Badge 
              key={`${filter.groupId}-${filter.optionId}-${index}`}
              variant="secondary"
              dismissible
              onDismiss={() => handleRemoveFilter(filter)}
            >
              {filter.label}
            </Badge>
          ))}
          
          {localFilters.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7 px-2"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Usage example:
 * 
 * const filterGroups = [
 *   {
 *     id: 'type',
 *     label: 'Document Type',
 *     options: [
 *       { id: 'portfolio', label: 'Portfolio Statement', value: 'portfolio' },
 *       { id: 'financial', label: 'Financial Report', value: 'financial' },
 *     ]
 *   },
 *   {
 *     id: 'date',
 *     label: 'Date',
 *     options: [
 *       { id: 'last30', label: 'Last 30 days', value: '30' },
 *       { id: 'last90', label: 'Last 90 days', value: '90' },
 *     ]
 *   }
 * ];
 * 
 * <SearchFilter
 *   searchPlaceholder="Search documents..."
 *   filterGroups={filterGroups}
 *   onSearchChange={(term) => console.log('Search term:', term)}
 *   onFilterChange={(filters) => console.log('Active filters:', filters)}
 * />
 */