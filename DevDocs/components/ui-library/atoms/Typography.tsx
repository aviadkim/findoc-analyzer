import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Type definitions for typography variants
 */
type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6'
  | 'p'
  | 'blockquote'
  | 'code'
  | 'lead'
  | 'large'
  | 'small'
  | 'muted';

/**
 * Props interface for the Typography component
 */
interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant: TypographyVariant;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
}

/**
 * Typography component for consistent text styling
 */
export function Typography({
  variant,
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  // Define the mapping of variants to component types
  const Component = as || ({
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    blockquote: 'blockquote',
    code: 'code',
    lead: 'p',
    large: 'p',
    small: 'small',
    muted: 'p',
  }[variant]);

  // Define the mapping of variants to Tailwind classes
  const variantClasses = {
    h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
    h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
    h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
    h6: 'scroll-m-20 text-base font-semibold tracking-tight',
    p: 'leading-7 [&:not(:first-child)]:mt-6',
    blockquote: 'mt-6 border-l-2 pl-6 italic',
    code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
    lead: 'text-xl text-muted-foreground',
    large: 'text-lg font-semibold',
    small: 'text-sm font-medium leading-none',
    muted: 'text-sm text-muted-foreground',
  };

  return React.createElement(
    Component as string,
    {
      className: cn(variantClasses[variant], className),
      ...props,
    },
    children
  );
}

/**
 * Specialized typography components
 */
export function Heading1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h1" {...props} />;
}

export function Heading2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h2" {...props} />;
}

export function Heading3(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h3" {...props} />;
}

export function Heading4(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h4" {...props} />;
}

export function Heading5(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h5" {...props} />;
}

export function Heading6(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h6" {...props} />;
}

export function Paragraph(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="p" {...props} />;
}

export function Blockquote(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="blockquote" {...props} />;
}

export function CodeBlock(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="code" {...props} />;
}

export function LeadText(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="lead" {...props} />;
}

export function LargeText(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="large" {...props} />;
}

export function SmallText(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="small" {...props} />;
}

export function MutedText(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="muted" {...props} />;
}

/**
 * Usage example:
 * 
 * <Heading1>Main Heading</Heading1>
 * <Paragraph>Regular paragraph text</Paragraph>
 * <MutedText>Secondary information</MutedText>
 * 
 * Or with the base component:
 * 
 * <Typography variant="h2" className="custom-class">Section Title</Typography>
 * <Typography variant="muted" as="span">Inline muted text</Typography>
 */