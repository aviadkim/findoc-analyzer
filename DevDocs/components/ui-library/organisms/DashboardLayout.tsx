import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui-library/atoms/Icon';
import { Button } from '@/components/ui/button';
import { Heading3 } from '@/components/ui-library/atoms/Typography';
import { Card } from '@/components/ui/card';

/**
 * Dashboard section configuration
 */
export interface DashboardSection {
  /** Unique identifier for the section */
  id: string;
  /** Display title for the section */
  title: string;
  /** Content to display in the section */
  content: React.ReactNode;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional extra actions */
  actions?: React.ReactNode;
  /** Column span (default: 1) */
  colSpan?: 1 | 2 | 3 | 4;
  /** Whether this section is collapsible */
  collapsible?: boolean;
  /** Whether this section is initially collapsed */
  defaultCollapsed?: boolean;
  /** 
   * Importance level of the section, affects positioning and visibility on smaller screens
   * Higher values are considered more important
   */
  priority?: number;
}

/**
 * Props for the DashboardLayout component
 */
interface DashboardLayoutProps {
  /** Sections to display in the dashboard */
  sections: DashboardSection[];
  /** Optional title for the entire dashboard */
  title?: string;
  /** Optional summary or description */
  summary?: React.ReactNode;
  /** Optional actions that appear in the header */
  actions?: React.ReactNode;
  /** Optional sidebar content */
  sidebar?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Default number of columns (responsive, default: 2) */
  defaultColumns?: 1 | 2 | 3 | 4;
  /** Whether to display a compact version of the dashboard */
  compact?: boolean;
}

/**
 * DashboardLayout component for organizing multiple data sections
 */
export function DashboardLayout({
  sections,
  title,
  summary,
  actions,
  sidebar,
  className,
  defaultColumns = 2,
  compact = false,
}: DashboardLayoutProps) {
  // State for tracking collapsed sections
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>(() => {
    // Initialize with defaultCollapsed values
    const collapsed: Record<string, boolean> = {};
    sections.forEach(section => {
      if (section.collapsible && section.defaultCollapsed) {
        collapsed[section.id] = true;
      }
    });
    return collapsed;
  });

  // Toggle collapsed state of a section
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Sort sections by priority if specified
  const sortedSections = [...sections].sort((a, b) => {
    const priorityA = a.priority ?? 0;
    const priorityB = b.priority ?? 0;
    return priorityB - priorityA;
  });

  // Determine column configuration based on default columns
  const getColumnClass = () => {
    switch (defaultColumns) {
      case 1: return "grid-cols-1";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      case 2:
      default: return "grid-cols-1 md:grid-cols-2";
    }
  };

  // Get column span class for a section
  const getColSpanClass = (colSpan: 1 | 2 | 3 | 4 = 1) => {
    switch (colSpan) {
      case 2: return "md:col-span-2";
      case 3: return "md:col-span-3";
      case 4: return "md:col-span-4";
      default: return "";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard header */}
      {(title || actions) && (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            {title && <Heading3>{title}</Heading3>}
            {summary && <div className="text-muted-foreground mt-1">{summary}</div>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}

      {/* Main dashboard content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Dashboard sections */}
        <div className={cn("flex-1", sidebar ? "lg:w-3/4" : "w-full")}>
          <div className={cn(
            "grid gap-6",
            getColumnClass(),
            compact && "gap-4"
          )}>
            {sortedSections.map((section) => (
              <Card
                key={section.id}
                className={cn(
                  getColSpanClass(section.colSpan),
                  "overflow-hidden"
                )}
              >
                <div className="p-6">
                  {/* Section header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {section.icon && <div className="text-muted-foreground">{section.icon}</div>}
                      <div>
                        <h3 className="text-lg font-semibold">{section.title}</h3>
                        {section.description && (
                          <p className="text-sm text-muted-foreground">{section.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {section.actions}
                      {section.collapsible && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection(section.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Icon
                            name={collapsedSections[section.id] ? "ChevronDown" : "ChevronUp"}
                            className="h-4 w-4"
                          />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Section content */}
                  <div className={cn(
                    "transition-all",
                    collapsedSections[section.id] && "hidden"
                  )}>
                    {section.content}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        {sidebar && (
          <aside className="lg:w-1/4 space-y-6">
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
}

/**
 * Usage example:
 * 
 * <DashboardLayout
 *   title="Portfolio Dashboard"
 *   summary="Overview of your financial positions and performance"
 *   actions={
 *     <Button>
 *       <Icon name="Download" className="mr-2 h-4 w-4" />
 *       Export Data
 *     </Button>
 *   }
 *   sections={[
 *     {
 *       id: "summary",
 *       title: "Portfolio Summary",
 *       icon: <Icon name="BarChart" />,
 *       content: <PortfolioSummary data={portfolioData} />,
 *       colSpan: 2,
 *       priority: 10
 *     },
 *     {
 *       id: "allocation",
 *       title: "Asset Allocation",
 *       icon: <Icon name="PieChart" />,
 *       content: <AssetAllocation data={allocationData} />,
 *       collapsible: true
 *     },
 *     {
 *       id: "performance",
 *       title: "Performance",
 *       icon: <Icon name="TrendingUp" />,
 *       content: <PerformanceChart data={performanceData} />,
 *       actions: <Button variant="ghost" size="sm">View History</Button>,
 *       collapsible: true
 *     }
 *   ]}
 *   sidebar={
 *     <Card>
 *       <CardHeader>
 *         <CardTitle>Activity Feed</CardTitle>
 *       </CardHeader>
 *       <CardContent>
 *         <ActivityFeed activities={recentActivities} />
 *       </CardContent>
 *     </Card>
 *   }
 * />
 */