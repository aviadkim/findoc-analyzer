import React from 'react';
import { cn } from '@/lib/utils';

type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse';
type FlexWrap = 'wrap' | 'wrap-reverse' | 'nowrap';
type JustifyContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';
type AlignContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
type Gap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64;

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Flex direction (row, column, etc.)
   */
  direction?: FlexDirection | ResponsiveValue<FlexDirection>;
  /**
   * Flex wrap
   */
  wrap?: FlexWrap | ResponsiveValue<FlexWrap>;
  /**
   * Justify content
   */
  justify?: JustifyContent | ResponsiveValue<JustifyContent>;
  /**
   * Align items
   */
  align?: AlignItems | ResponsiveValue<AlignItems>;
  /**
   * Align content
   */
  alignContent?: AlignContent | ResponsiveValue<AlignContent>;
  /**
   * Gap between items
   */
  gap?: Gap | ResponsiveValue<Gap>;
  /**
   * Flex content
   */
  children: React.ReactNode;
  /**
   * Additional classes
   */
  className?: string;
}

/**
 * Helper function to generate responsive class strings
 */
function getResponsiveClasses<T>(
  baseClass: string,
  value: T | ResponsiveValue<T> | undefined,
  transform: (val: T) => string
): string {
  if (value === undefined) return '';
  
  if (typeof value === 'object') {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    return breakpoints
      .filter(bp => value[bp] !== undefined)
      .map(bp => {
        const prefix = bp === 'xs' ? '' : `${bp}:`;
        return `${prefix}${baseClass}-${transform(value[bp]!)}`;
      })
      .join(' ');
  }
  
  return `${baseClass}-${transform(value)}`;
}

/**
 * Responsive flex layout component
 */
export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    className, 
    direction, 
    wrap, 
    justify, 
    align, 
    alignContent, 
    gap,
    children, 
    ...props 
  }, ref) => {
    // Transform functions for each property
    const transformDirection = (val: FlexDirection) => val;
    const transformWrap = (val: FlexWrap) => val;
    const transformJustify = (val: JustifyContent) => val;
    const transformAlign = (val: AlignItems) => val;
    const transformAlignContent = (val: AlignContent) => val;
    const transformGap = (val: Gap) => val;

    // Generate classes for each property
    const directionClasses = getResponsiveClasses('flex', direction, transformDirection);
    const wrapClasses = getResponsiveClasses('flex', wrap, transformWrap);
    const justifyClasses = getResponsiveClasses('justify', justify, transformJustify);
    const alignClasses = getResponsiveClasses('items', align, transformAlign);
    const alignContentClasses = getResponsiveClasses('content', alignContent, transformAlignContent);
    const gapClasses = getResponsiveClasses('gap', gap, transformGap);

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses,
          wrapClasses,
          justifyClasses,
          alignClasses,
          alignContentClasses,
          gapClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

export default Flex;