import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated' | 'filled' | 'subtle'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
      outline: "rounded-lg border-2 border-border bg-transparent text-card-foreground",
      elevated: "rounded-lg border-0 bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-200",
      filled: "rounded-lg border-0 bg-primary-100 dark:bg-primary-900/30 text-card-foreground",
      subtle: "rounded-lg bg-background/80 text-card-foreground border border-border/50 backdrop-blur-sm"
    }
    
    return (
      <div
        ref={ref}
        className={cn(variantStyles[variant], className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, compact = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col", 
        compact ? "space-y-1 p-4" : "space-y-1.5 p-6",
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => {
    const Comp = Component as any
    return (
      <Comp
        ref={ref}
        className={cn(
          "font-semibold leading-none tracking-tight",
          Component === 'h1' ? "text-2xl" :
          Component === 'h2' ? "text-xl" :
          Component === 'h3' ? "text-lg" :
          "text-base",
          className
        )}
        {...props}
      />
    )
  }
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean
  padTop?: boolean
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, compact = false, padTop = false, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        compact ? "p-4" : "p-6", 
        !padTop && (compact ? "pt-0" : "pt-2"),
        className
      )} 
      {...props} 
    />
  )
)
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean
  border?: boolean
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, compact = false, border = false, justify = 'start', ...props }, ref) => {
    const justifyStyles = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around'
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center",
          compact ? "p-4" : "p-6", 
          "pt-0",
          border && "mt-4 border-t border-border pt-4",
          justifyStyles[justify],
          className
        )}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
