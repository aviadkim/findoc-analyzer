import React from 'react';
import { cn } from '@/lib/utils';
import { Breakpoint } from '@/lib/hooks/useResponsive';

export interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Direction to stack the elements on different screen sizes
   */
  direction?: 'horizontal' | 'vertical' | { 
    xs?: 'horizontal' | 'vertical';
    sm?: 'horizontal' | 'vertical';
    md?: 'horizontal' | 'vertical';
    lg?: 'horizontal' | 'vertical';
    xl?: 'horizontal' | 'vertical';
    '2xl'?: 'horizontal' | 'vertical';
  };
  /**
   * Spacing between items (can be responsive)
   */
  spacing?: number | {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  /**
   * Alignment of items
   */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /**
   * Distribution of items
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /**
   * Content to be stacked
   */
  children: React.ReactNode;
  /**
   * Whether to wrap items
   */
  wrap?: boolean;
}

/**
 * A component that stacks children either horizontally or vertically and responsively changes direction based on screen size
 */
export const ResponsiveStack = React.forwardRef<HTMLDivElement, ResponsiveStackProps>(
  ({ className, direction = 'vertical', spacing = 4, align = 'start', justify = 'start', wrap = false, children, ...props }, ref) => {
    // Classes for direction
    let directionClasses = '';
    
    if (typeof direction === 'string') {
      directionClasses = direction === 'horizontal' ? 'flex-row' : 'flex-col';
    } else {
      // Determine responsive direction classes
      const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      
      directionClasses = breakpoints
        .filter((bp) => direction[bp] !== undefined)
        .map((bp) => {
          const prefix = bp === 'xs' ? '' : `${bp}:`;
          const flexDirection = direction[bp] === 'horizontal' ? 'flex-row' : 'flex-col';
          return `${prefix}${flexDirection}`;
        })
        .join(' ');
    }

    // Classes for spacing
    let spacingClasses = '';
    
    if (typeof spacing === 'number') {
      spacingClasses = `gap-${spacing}`;
    } else {
      // Determine responsive spacing classes
      const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      
      spacingClasses = breakpoints
        .filter((bp) => spacing[bp] !== undefined)
        .map((bp) => {
          const prefix = bp === 'xs' ? '' : `${bp}:`;
          return `${prefix}gap-${spacing[bp]}`;
        })
        .join(' ');
    }

    // Classes for alignment
    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    }[align];

    // Classes for justification
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }[justify];

    // Classes for wrapping
    const wrapClasses = wrap ? 'flex-wrap' : 'flex-nowrap';

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses,
          spacingClasses,
          alignClasses,
          justifyClasses,
          wrapClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveStack.displayName = 'ResponsiveStack';

export default ResponsiveStack;