import React from 'react';
import { Breakpoint } from '@/lib/hooks/useResponsive';

export interface HiddenProps {
  /**
   * Hide on these breakpoints (inclusive)
   */
  on?: Breakpoint[];
  /**
   * Hide below this breakpoint (exclusive)
   */
  below?: Breakpoint;
  /**
   * Hide above this breakpoint (exclusive)
   */
  above?: Breakpoint;
  /**
   * Hide between these breakpoints (inclusive)
   */
  between?: [Breakpoint, Breakpoint];
  /**
   * Content to hide/show
   */
  children: React.ReactNode;
  /**
   * Use 'visibility: hidden' instead of 'display: none'.
   * This keeps the element in the DOM layout but makes it invisible.
   */
  keepInLayout?: boolean;
}

/**
 * Component that conditionally hides its children based on breakpoints
 */
export const Hidden: React.FC<HiddenProps> = ({
  on,
  below,
  above,
  between,
  children,
  keepInLayout = false,
}) => {
  let classes = '';

  // Hide on specific breakpoints
  if (on?.length) {
    classes = on.map(bp => `${bp === 'xs' ? '' : bp + ':'}hidden`).join(' ');
  }

  // Hide below a breakpoint (e.g., hidden in mobile but visible on tablet and above)
  if (below) {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    const belowIndex = breakpoints.indexOf(below);
    if (belowIndex > 0) {
      const breakpointsToHide = breakpoints.slice(0, belowIndex);
      classes = breakpointsToHide
        .map(bp => `${bp === 'xs' ? '' : bp + ':'}hidden`)
        .join(' ');
    }
  }

  // Hide above a breakpoint (e.g., visible on mobile but hidden on tablet and above)
  if (above) {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    const aboveIndex = breakpoints.indexOf(above);
    if (aboveIndex < breakpoints.length - 1) {
      const breakpointsToHide = breakpoints.slice(aboveIndex + 1);
      classes = breakpointsToHide
        .map(bp => `${bp}:hidden`)
        .join(' ');
    }
  }

  // Hide between breakpoints (e.g., hidden on tablet but visible on mobile and desktop)
  if (between && between.length === 2) {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    const startIndex = breakpoints.indexOf(between[0]);
    const endIndex = breakpoints.indexOf(between[1]);
    
    if (startIndex >= 0 && endIndex >= 0 && endIndex > startIndex) {
      const breakpointsToHide = breakpoints.slice(startIndex, endIndex + 1);
      classes = breakpointsToHide
        .map(bp => `${bp === 'xs' ? '' : bp + ':'}hidden`)
        .join(' ');
    }
  }

  // If keepInLayout, use 'invisible' instead of 'hidden'
  if (keepInLayout && classes) {
    classes = classes.replace(/hidden/g, 'invisible');
  }

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Hidden;