import React from 'react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

/**
 * Props for the Icon component
 */
interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** The name of the Lucide icon to display */
  name: keyof typeof LucideIcons;
  /** Size of the icon in pixels (default: 24) */
  size?: number;
  /** Optional color for the icon */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to make the icon strokeWidth thinner (1.5 instead of 2) */
  thin?: boolean;
  /** Optional automatic label for accessibility */
  label?: string;
}

/**
 * Icon component that wraps Lucide icons with consistent styling and accessibility
 */
export function Icon({
  name,
  size = 24,
  color,
  className,
  thin = false,
  label,
  ...props
}: IconProps) {
  const IconComponent = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
  
  if (!IconComponent) {
    console.error(`Icon "${name}" not found in Lucide icons`);
    return null;
  }

  const ariaLabel = label || `${name.replace(/([A-Z])/g, ' $1').trim()} icon`;

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={thin ? 1.5 : 2}
      className={cn('inline-block', className)}
      aria-label={ariaLabel}
      aria-hidden={!label}
      {...props}
    />
  );
}

/**
 * Usage examples:
 * 
 * <Icon name="FileText" />
 * <Icon name="AlertCircle" size={16} color="red" />
 * <Icon name="ChevronRight" className="ml-2" thin />
 * <Icon name="Info" label="Information" />
 */