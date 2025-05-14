import * as React from "react"

import { cn } from "../../utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "outline" | "opaque"
    padding?: "none" | "sm" | "md" | "lg"
    hover?: boolean
  }
>(({ className, variant = "default", padding = "md", hover = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg shadow-sm",
      variant === "default" && "bg-card text-card-foreground border",
      variant === "outline" && "border bg-transparent",
      variant === "opaque" && "bg-muted border-muted",
      padding === "none" && "p-0",
      padding === "sm" && "p-4",
      padding === "md" && "p-6",
      padding === "lg" && "p-8",
      hover && "transition-colors hover:border-primary/50",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: React.ElementType }
>(({ className, as: Component = "h3", ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { noPadding?: boolean }
>(({ className, noPadding = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(noPadding ? "" : "pt-6", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const CardDivider = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn("border-t my-4", className)}
    {...props}
  />
))
CardDivider.displayName = "CardDivider"

// Financial-specific card components
const FinancialCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string | number
    trend?: "up" | "down" | "neutral"
    changeValue?: string | number
    changePercent?: string | number
    icon?: React.ReactNode
  }
>(({ 
  className, 
  value, 
  trend, 
  changeValue,
  changePercent,
  icon,
  children, 
  ...props 
}, ref) => (
  <Card ref={ref} className={cn("", className)} {...props}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{children}</CardTitle>
      {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
    </CardHeader>
    <CardContent noPadding>
      <div className="text-2xl font-bold financial-nums">{value}</div>
      {(changeValue || changePercent) && (
        <p 
          className={cn(
            "text-xs flex items-center gap-1 mt-1",
            trend === "up" && "text-success",
            trend === "down" && "text-destructive",
            trend === "neutral" && "text-muted-foreground"
          )}
        >
          {trend === "up" && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
            </svg>
          )}
          {trend === "down" && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          )}
          {changeValue && changePercent && (
            <>
              {changeValue} ({changePercent})
            </>
          )}
          {changeValue && !changePercent && (
            <>{changeValue}</>
          )}
          {!changeValue && changePercent && (
            <>{changePercent}</>
          )}
        </p>
      )}
    </CardContent>
  </Card>
))
FinancialCard.displayName = "FinancialCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardDivider,
  FinancialCard 
}