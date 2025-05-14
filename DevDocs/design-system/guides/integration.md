# Integrating the FinDoc Design System

This guide provides step-by-step instructions for integrating the FinDoc Design System into your application.

## Table of Contents

1. [Installation](#installation)
2. [Setup](#setup)
3. [Theme Configuration](#theme-configuration)
4. [Using Components](#using-components)
5. [Styling Guidelines](#styling-guidelines)
6. [Custom Theming](#custom-theming)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Node.js 16.0.0 or later
- React 18.0.0 or later
- Next.js 13.0.0 or later (recommended)

### Install Dependencies

```bash
# Using npm
npm install findoc-design-system

# Using yarn
yarn add findoc-design-system

# Using pnpm
pnpm add findoc-design-system
```

Alternatively, if you're using the design system locally:

```bash
# Add as a local dependency
npm install ../path/to/design-system
```

## Setup

### 1. Configure Tailwind CSS

Update your `tailwind.config.js` or `tailwind.config.ts` file to include the design system's paths:

```typescript
import { Config } from 'tailwindcss'
import { designSystemConfig } from 'findoc-design-system/tailwind'

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
    // Include the design system components
    './node_modules/findoc-design-system/**/*.{js,jsx,ts,tsx}',
  ],
  // Spread in the design system config
  ...designSystemConfig,
  // You can extend or override here
  theme: {
    extend: {
      // Additional customizations
      ...designSystemConfig.theme.extend,
    },
  },
  plugins: [
    ...(designSystemConfig.plugins || []),
    // Add additional plugins here
  ],
}

export default config
```

### 2. Import Styles

Import the design system styles in your main CSS file or in your main layout component:

```typescript
// app/globals.css or similar
import 'findoc-design-system/styles/globals.css'
import './additional-styles.css' // Your custom styles
```

### 3. Set Up Theme Provider

Wrap your application with the `ThemeProvider` component to enable dark mode and theming support:

```tsx
// app/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'findoc-design-system/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem
    >
      {children}
      <Toaster />
    </ThemeProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

## Theme Configuration

### Using Theme Variables

The design system uses CSS variables to define its theme, which can be accessed in your CSS:

```css
.custom-element {
  color: var(--primary);
  background-color: var(--background);
  border-radius: var(--radius);
}
```

Or in your Tailwind classes:

```jsx
<div className="bg-background text-foreground rounded-lg">
  Content
</div>
```

### Accessing Theme in JavaScript

You can access theme values in JavaScript/TypeScript:

```tsx
import { themeConfig } from 'findoc-design-system'

function MyComponent() {
  // Use theme values
  console.log('Primary color:', themeConfig.colors.primary)
  
  return <div>My Component</div>
}
```

## Using Components

### Basic Usage

Import and use components from the design system:

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from 'findoc-design-system'

export default function MyPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content goes here</p>
          <Button>View Details</Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Using Specialized Financial Components

The design system includes specialized components for financial data:

```tsx
import { 
  FinancialCard, 
  FinancialDataTable
} from 'findoc-design-system'
import { DollarSign } from 'lucide-react'

export default function Dashboard() {
  // Sample data
  const portfolioData = {
    // ...portfolio data
  }
  
  const tableData = [
    // ...financial table data
  ]
  
  const columns = [
    // ...column definitions
  ]
  
  return (
    <div className="space-y-6">
      <div className="dashboard-grid">
        <FinancialCard
          value="$45,231.89"
          trend="up"
          changePercent="+20.1%"
          icon={<DollarSign />}
        >
          Total Assets
        </FinancialCard>
        
        {/* More cards... */}
      </div>
      
      <FinancialDataTable
        columns={columns}
        data={tableData}
        searchColumn="ticker"
      />
    </div>
  )
}
```

## Styling Guidelines

### Component Customization

All components accept a `className` prop that you can use to override or extend the base styles:

```tsx
<Button 
  className="bg-blue-700 hover:bg-blue-800"
  size="lg"
>
  Custom Button
</Button>
```

For more complex customization, use the `cn` utility:

```tsx
import { cn } from 'findoc-design-system'

<Card
  className={cn(
    "border-2", 
    isActive && "border-primary",
    isDisabled && "opacity-50 pointer-events-none"
  )}
>
  Content
</Card>
```

### Consistent Spacing

Use the spacing scale from the design system:

```tsx
<div className="p-4 m-6 space-y-4">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
</div>
```

### Typography

Use the typography classes for consistent text styling:

```tsx
<h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
<p className="text-muted-foreground">
  Your financial overview
</p>
<span className="financial-positive">+12.5%</span>
```

## Custom Theming

### Creating a Custom Theme

You can create a custom theme by modifying CSS variables. Create a new CSS file:

```css
/* themes/custom-theme.css */
:root {
  --primary: 210 100% 50%; /* Custom blue */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  /* Override other variables as needed */
}

.dark {
  --primary: 210 100% 60%; /* Custom blue for dark mode */
  --primary-foreground: 0 0% 100%;
  /* Override other dark mode variables */
}
```

Import this CSS file after the design system styles:

```tsx
import 'findoc-design-system/styles/globals.css'
import '../themes/custom-theme.css' // Your custom theme
```

### Creating a Branded Theme

For a complete branded experience, you can create multiple themed CSS files:

```css
/* themes/acme-financial.css */
:root {
  /* Acme Financial brand colors */
  --primary: 220 80% 50%; /* Acme blue */
  --secondary: 43 96% 56%; /* Acme gold */
  /* Other brand-specific overrides */
  
  /* Custom values */
  --acme-primary: 220 80% 50%;
  --acme-secondary: 43 96% 56%;
  --acme-tertiary: 162 94% 30%;
}

.dark {
  /* Dark mode overrides for Acme */
}
```

## Best Practices

### File Organization

Structure your components to work with the design system:

```
src/
├── components/
│   ├── dashboard/
│   │   ├── AssetAllocation.tsx  # Uses design system components
│   │   ├── PortfolioSummary.tsx # Uses design system components
│   │   └── index.ts             # Exports dashboard components
│   ├── documents/
│   │   └── ...
│   └── common/
│       └── ...
├── app/
│   ├── dashboard/
│   │   └── page.tsx             # Page using dashboard components
│   └── ...
└── ...
```

### Component Design

When building new components:

1. Leverage design system primitives
2. Follow established patterns
3. Use appropriate semantic HTML
4. Maintain accessibility
5. Consider light and dark modes

Example of a good custom component:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from 'findoc-design-system'
import { cn, formatCurrency, formatPercentage } from 'findoc-design-system'

interface SecurityCardProps {
  security: {
    name: string
    ticker: string
    price: number
    change: number
    volume: number
  }
  className?: string
}

export function SecurityCard({ security, className }: SecurityCardProps) {
  const isPositive = security.change > 0
  
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{security.ticker}</CardTitle>
            <p className="text-sm text-muted-foreground">{security.name}</p>
          </div>
          <span 
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? "+" : ""}{formatPercentage(security.change / 100)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold financial-nums">
            {formatCurrency(security.price)}
          </span>
          <span className="text-sm text-muted-foreground">
            Vol: {security.volume.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Troubleshooting

### Common Issues

#### Styles Not Loading Correctly

- Ensure the design system styles are imported before your custom styles
- Check that your Tailwind config includes the design system paths
- Verify you're using the correct class names

#### Component Prop Type Errors

- Make sure you're importing from the correct paths
- Check the component API documentation for required props
- Ensure you're passing the correct prop types

#### Dark Mode Not Working

- Verify the `ThemeProvider` is set up correctly
- Make sure `attribute="class"` is set on the provider
- Check if you have `suppressHydrationWarning` on your `<html>` tag

### Getting Help

If you encounter issues not covered here:

1. Check the design system documentation
2. Look for examples in the `/examples` directory
3. Consult the component source code
4. Contact the design system team