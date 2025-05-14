import React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns for different breakpoints
   */
  cols?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; '2xl'?: number };
  /**
   * Gap between grid items
   */
  gap?: number | string;
  /**
   * Row gap between grid items (if different from column gap)
   */
  rowGap?: number | string;
  /**
   * Column gap between grid items (if different from row gap)
   */
  columnGap?: number | string;
  /**
   * Grid content
   */
  children: React.ReactNode;
}

/**
 * Responsive grid layout component
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap, rowGap, columnGap, children, ...props }, ref) => {
    // For simple number of columns
    const getColsClass = (columns: number) => {
      if (columns === 1) return 'grid-cols-1';
      if (columns === 2) return 'grid-cols-2';
      if (columns === 3) return 'grid-cols-3';
      if (columns === 4) return 'grid-cols-4';
      if (columns === 5) return 'grid-cols-5';
      if (columns === 6) return 'grid-cols-6';
      if (columns === 7) return 'grid-cols-7';
      if (columns === 8) return 'grid-cols-8';
      if (columns === 9) return 'grid-cols-9';
      if (columns === 10) return 'grid-cols-10';
      if (columns === 11) return 'grid-cols-11';
      if (columns === 12) return 'grid-cols-12';
      return 'grid-cols-1';
    };

    // Prepare responsive column classes
    let colClasses = '';
    if (typeof cols === 'number') {
      colClasses = getColsClass(cols);
    } else {
      // Responsive columns
      const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
      colClasses = breakpoints
        .filter((bp) => cols[bp] !== undefined)
        .map((bp) => {
          const prefix = bp === 'xs' ? '' : `${bp}:`;
          return `${prefix}${getColsClass(cols[bp] || 1)}`;
        })
        .join(' ');
    }

    // Prepare gap classes
    const gapClass = gap !== undefined ? `gap-${gap}` : '';
    const rowGapClass = rowGap !== undefined ? `row-gap-${rowGap}` : '';
    const colGapClass = columnGap !== undefined ? `col-gap-${columnGap}` : '';

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colClasses,
          gapClass,
          rowGapClass,
          colGapClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export default Grid;