import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Typography component for consistent text styling across the application
 * Provides variants for heading levels, paragraphs, and specialized text styles
 * Supports semantic HTML elements while maintaining consistent styling
 */

const typographyVariants = cva("", {
  variants: {
    variant: {
      // Heading styles
      h1: "text-4xl font-bold tracking-tight scroll-m-20 lg:text-5xl",
      h2: "text-3xl font-semibold tracking-tight scroll-m-20",
      h3: "text-2xl font-semibold tracking-tight scroll-m-20",
      h4: "text-xl font-semibold tracking-tight scroll-m-20",
      h5: "text-lg font-semibold tracking-tight scroll-m-20",
      h6: "text-base font-semibold tracking-tight scroll-m-20",
      
      // Body text styles
      p: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      
      // UI text styles
      blockquote: "mt-6 border-l-2 border-border pl-6 italic",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
      label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      caption: "text-xs text-muted-foreground",
      "section-title": "text-base font-semibold tracking-tight text-foreground",
      "section-subtitle": "text-sm text-muted-foreground",
      
      // Data display styles
      "metric-value": "text-3xl font-bold tracking-tight",
      "metric-label": "text-sm font-medium text-muted-foreground",
      "table-header": "text-xs font-medium text-muted-foreground uppercase",
      "card-title": "text-lg font-semibold leading-none tracking-tight",
      "card-description": "text-sm text-muted-foreground",
      
      // Status text styles
      success: "text-sm font-medium text-success-foreground",
      error: "text-sm font-medium text-destructive",
      warning: "text-sm font-medium text-warning",
      info: "text-sm font-medium text-info",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    transform: {
      uppercase: "uppercase",
      lowercase: "lowercase",
      capitalize: "capitalize",
      normal: "normal-case",
    },
    truncate: {
      true: "truncate",
    },
  },
  defaultVariants: {
    variant: "p",
    weight: "normal",
    align: "left",
  },
});

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>["ref"];

type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

export interface TypographyProps
  extends VariantProps<typeof typographyVariants> {
  className?: string;
  asChild?: boolean;
}

type TypographyComponent = <C extends React.ElementType = "p">(
  props: PolymorphicComponentPropWithRef<C, TypographyProps>
) => React.ReactElement | null;

export const Typography: TypographyComponent = React.forwardRef(
  <C extends React.ElementType = "p">(
    {
      className,
      variant,
      weight,
      align,
      transform,
      truncate,
      as,
      asChild,
      ...props
    }: PolymorphicComponentPropWithRef<C, TypographyProps>,
    ref?: PolymorphicRef<C>
  ) => {
    // Default component based on variant if not explicitly specified
    const getDefaultComponent = (variant: string | undefined): React.ElementType => {
      switch (variant) {
        case "h1": return "h1";
        case "h2": return "h2";
        case "h3": return "h3";
        case "h4": return "h4";
        case "h5": return "h5";
        case "h6": return "h6";
        case "p": return "p";
        case "blockquote": return "blockquote";
        case "code": return "code";
        case "label": return "label";
        case "caption": return "span";
        case "lead": return "p";
        default: return "p";
      }
    };

    const Component = as || getDefaultComponent(variant);

    return (
      <Component
        ref={ref}
        className={cn(
          typographyVariants({
            variant,
            weight,
            align,
            transform,
            truncate,
          }),
          className
        )}
        {...props}
      />
    );
  }
);

Typography.displayName = "Typography";

export function Heading({
  level = 1,
  children,
  className,
  ...props
}: {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
} & Omit<TypographyProps, "variant">) {
  const variant = `h${level}` as keyof typeof typographyVariants.variants.variant;
  
  return (
    <Typography 
      variant={variant} 
      as={`h${level}` as React.ElementType}
      className={className}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function Text({
  children,
  className,
  variant = "p",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "p" | "lead" | "large" | "small" | "muted" | "caption";
} & Omit<TypographyProps, "variant">) {
  return (
    <Typography 
      variant={variant}
      className={className}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function SectionTitle({
  title,
  subtitle,
  className,
  subtitleClassName,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className="mb-6">
      <Typography 
        variant="section-title"
        className={className}
      >
        {title}
      </Typography>
      
      {subtitle && (
        <Typography
          variant="section-subtitle"
          className={cn("mt-1", subtitleClassName)}
        >
          {subtitle}
        </Typography>
      )}
    </div>
  );
}

export function MetricDisplay({
  value,
  label,
  trend,
  trendValue,
  className,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center">
        <Typography variant="metric-value">
          {value}
        </Typography>
        
        {trend && trendValue && (
          <span className={cn(
            "ml-2 flex items-center text-sm font-medium",
            trend === "up" ? "text-success" : 
            trend === "down" ? "text-destructive" : 
            "text-muted-foreground"
          )}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
            {trendValue}
          </span>
        )}
      </div>
      
      <Typography variant="metric-label">
        {label}
      </Typography>
    </div>
  );
}