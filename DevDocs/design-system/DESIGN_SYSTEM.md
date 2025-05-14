# FinDoc Analyzer Design System

This design system defines the visual language and component library for the FinDoc Analyzer application. It provides a comprehensive set of guidelines, tokens, and components to create a consistent, accessible, and visually appealing user experience.

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Component Styles](#component-styles)
5. [Usage Guidelines](#usage-guidelines)
6. [Accessibility Considerations](#accessibility-considerations)
7. [Financial-Specific Components](#financial-specific-components)

## Color System

Our color system is designed for financial applications, focusing on clarity, professionalism, and functional indications (gains, losses, risk levels).

### Primary Colors

- **Primary**: A deep blue (#1e3a8a) that conveys trust and reliability
- **Secondary**: A light bluish-gray for secondary elements and actions
- **Accent**: Subtle blue tints for accent elements

### Functional Colors

- **Success**: Green (#10b981) for positive outcomes and confirmations
- **Warning**: Amber (#f59e0b) for warnings and pending states
- **Error/Destructive**: Red (#ef4444) for errors and destructive actions
- **Info**: Blue (#3b82f6) for informational elements

### Financial-Specific Colors

- **Gain**: Green (#15803d) for positive financial changes
- **Loss**: Red (#ef4444) for negative financial changes
- **Neutral**: Slate (#64748b) for neutral values
- **Risk Levels**: 
  - Low: Green (#10b981)
  - Medium: Amber (#f59e0b)
  - High: Red (#ef4444)

### Data Visualization Colors

A set of distinct, accessible colors optimized for charts and visual data representation:
- Chart 1: Primary blue (#1e3a8a)
- Chart 2: Bright blue (#3b82f6)
- Chart 3: Cyan (#06b6d4)
- Chart 4: Green (#10b981)
- Chart 5: Purple (#d946ef)

### Dark Mode

All colors have dark mode variants that maintain appropriate contrast and readability while reducing eye strain in low-light environments.

### High Contrast Mode

A high contrast version is available for accessibility needs, providing maximum contrast between elements.

## Typography

### Font Families

- **Primary**: Inter (sans-serif)
- **Fallback**: Arial, Helvetica, sans-serif
- **Monospace**: JetBrains Mono (for code and financial data that benefits from equal-width characters)

### Font Sizes

- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)

### Font Weights

- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Line Heights

- **Tight**: 1.25 (Headings)
- **Normal**: 1.5 (Body text)
- **Relaxed**: 1.75 (Long-form content)

### Financial Typography

Financial data should use:
- Tabular numbers (`font-variant-numeric: tabular-nums`) for proper alignment of figures
- Monospace font for better readability of numerical data
- Consistent formatting for currencies, percentages, and dates

## Spacing System

Our spacing system uses a consistent scale to create visual rhythm and proper relationships between elements.

### Spacing Scale

- **px**: 1px
- **0.5**: 0.125rem (2px)
- **1**: 0.25rem (4px)
- **1.5**: 0.375rem (6px)
- **2**: 0.5rem (8px)
- **2.5**: 0.625rem (10px)
- **3**: 0.75rem (12px)
- **3.5**: 0.875rem (14px)
- **4**: 1rem (16px)
- **5**: 1.25rem (20px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **10**: 2.5rem (40px)
- **12**: 3rem (48px)
- **16**: 4rem (64px)
- **20**: 5rem (80px)
- **24**: 6rem (96px)

### Layout Guidelines

- **Content width**: Maximum 1400px for dashboard and content areas
- **Sidebar width**: 250px (fixed)
- **Grid system**: 12-column grid for complex layouts
- **Container padding**: 2rem (32px) in most cases

## Component Styles

### Core Components

Our design system includes standard UI components with styles optimized for financial applications:

- **Button**: Primary, secondary, outline, ghost, and destructive variants
- **Card**: For containing content with consistent styling
- **Input & Form elements**: Styled for clear data entry
- **Table**: Enhanced for financial data display
- **Alert & Notifications**: For system feedback

### Financial-Specific Components

- **FinancialMetricCard**: For displaying key financial metrics with trend indicators
- **RiskBadge**: Visual indicator for risk levels
- **ValueChange**: For displaying financial changes with proper formatting and visual indicators
- **DataCard**: Specialized card for financial data sets
- **FinancialDataTable**: Enhanced table for financial data with sorting and filtering

## Usage Guidelines

### Implementation Steps

1. Import the design tokens:
   ```tsx
   import '@/design-system/styles/globals.css';
   ```

2. Use the component library:
   ```tsx
   import { Button, Card, FinancialMetricCard } from '@/design-system/components/ui';
   ```

3. Apply utility classes in your JSX:
   ```tsx
   <div className="financial">$1,234.56</div>
   <div className="trend-up">4.7%</div>
   ```

### Best Practices

1. **Consistency**: Use the provided components and tokens rather than custom values
2. **Financial Data Display**:
   - Always use tabular numbers for financial figures
   - Include appropriate indicators for changes (up/down arrows)
   - Format numbers consistently (decimal places, thousands separators)
3. **Accessibility**:
   - Don't rely solely on color to convey meaning
   - Include appropriate text and icons alongside color indicators
4. **Responsive Design**:
   - Use the provided breakpoints for responsive layouts
   - Test designs at all breakpoints

## Accessibility Considerations

The design system is built with accessibility in mind:

- **Color Contrast**: All colors meet WCAG 2.1 AA standards (4.5:1 for normal text)
- **Focus States**: Visible focus indicators for keyboard navigation
- **Screen Readers**: Components include appropriate ARIA attributes
- **Color Independence**: Information is not conveyed by color alone
- **Responsive Text**: Text scales appropriately across devices

## Financial-Specific Components

### FinancialMetricCard

Displays a key financial metric with trend indicators.

```tsx
<FinancialMetricCard 
  title="Total Assets"
  value={1234567.89}
  previousValue={1200000}
  percentChange={2.87}
  trend="up"
  valuePrefix="$"
/>
```

### RiskBadge

Visual indicator for risk levels.

```tsx
<RiskBadge level="medium" />
<RiskBadge level="high" label="High Risk" size="lg" />
```

### ValueChange

Displays financial changes with proper formatting and visual indicators.

```tsx
<ValueChange value={-2.5} format="percentage" />
<ValueChange value={1250} format="currency" currencyCode="USD" />
```

### DataCard

Specialized card for financial data sets.

```tsx
<DataCard 
  title="Portfolio Performance" 
  description="Last 30 days"
  headerAction={<Button variant="ghost" size="sm">View All</Button>}
>
  <BarChart data={performanceData} />
</DataCard>
```

### FinancialDataTable

Enhanced table for financial data with sorting and filtering.

```tsx
<FinancialDataTable
  columns={tableColumns}
  data={financialData}
  searchColumn="ticker"
  showPagination={true}
/>
```