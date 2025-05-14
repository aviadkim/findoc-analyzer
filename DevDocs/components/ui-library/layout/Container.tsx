import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Makes the container fluid width (100%)
   */
  fluid?: boolean;
  /**
   * Controls max width for different screen sizes (overrides the default container max-widths)
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'screen' | null;
  /**
   * Content
   */
  children: React.ReactNode;
}

/**
 * Container component that provides consistent maximum width and padding based on screen size
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, fluid = false, maxWidth = null, children, ...props }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
      screen: 'max-w-screen'
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Default container behavior
          fluid ? 'w-full' : 'container',
          // Override max-width if specified
          maxWidth ? maxWidthClasses[maxWidth] : '',
          // Pass additional classNames
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;