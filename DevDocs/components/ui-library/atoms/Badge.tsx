import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge variants for different visual styles
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: 
          "border-transparent bg-green-500 text-white hover:bg-green-500/80",
        warning: 
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
        info: 
          "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Props interface for the Badge component
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional icon to display before the text */
  icon?: React.ReactNode;
  /** Whether the badge can be dismissed */
  dismissible?: boolean;
  /** Callback for when the badge is dismissed */
  onDismiss?: () => void;
}

/**
 * Badge component for tags, labels and status indicators
 */
export function Badge({
  className,
  variant,
  icon,
  dismissible,
  onDismiss,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {dismissible && (
        <button
          className="ml-1 rounded-full hover:bg-muted/20"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Usage examples:
 * 
 * <Badge>New</Badge>
 * <Badge variant="destructive">Error</Badge>
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="info" icon={<Icon name="Info" size={12} />}>Information</Badge>
 * <Badge variant="warning" dismissible onDismiss={() => console.log('dismissed')}>Alert</Badge>
 */