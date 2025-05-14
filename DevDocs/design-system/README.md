# FinDoc Analyzer Design System

This design system provides a comprehensive set of guidelines, components, and patterns for creating a consistent and accessible user experience across the FinDoc Analyzer application.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Accessibility](#accessibility)
7. [Implementation Guidelines](#implementation-guidelines)
8. [Usage Examples](#usage-examples)

## Design Principles

Our design is guided by the following principles:

### Clarity
- Prioritize content and data visibility
- Use clear, concise language
- Present complex financial information in easily digestible formats

### Efficiency
- Design for task completion with minimal steps
- Create intuitive navigation paths
- Optimize workflows for financial professionals

### Trustworthiness
- Project reliability through consistent, polished interfaces
- Maintain a professional aesthetic appropriate for financial applications
- Ensure data accuracy and precision in visualizations

### Accessibility
- Design for users of all abilities
- Follow WCAG 2.1 AA standards at minimum
- Test with various assistive technologies

## Color System

Our color system is designed to provide clear visual hierarchy, ensure high readability, and communicate meaning consistently.

### Primary Colors

The primary colors represent the brand identity of FinDoc Analyzer.

- **Primary**: Used for key actions and elements that need emphasis
  - Light mode: `#171717` (HSL: 0 0% 9%)
  - Dark mode: `#FAFAFA` (HSL: 0 0% 98%)

- **Secondary**: Used for secondary actions and supporting elements
  - Light mode: `#F5F5F5` (HSL: 0 0% 96.1%)
  - Dark mode: `#262626` (HSL: 0 0% 14.9%)

### Functional Colors

- **Success**: `#10B981` - For positive outcomes, confirmations
- **Warning**: `#F59E0B` - For warnings, pending actions
- **Error/Destructive**: `#EF4444` - For errors, destructive actions
- **Info**: `#3B82F6` - For informational elements

### Neutral Colors

- **Background**: 
  - Light mode: `#FFFFFF` (HSL: 0 0% 100%)
  - Dark mode: `#0A0A0A` (HSL: 0 0% 3.9%)

- **Foreground**: 
  - Light mode: `#0A0A0A` (HSL: 0 0% 3.9%)
  - Dark mode: `#FAFAFA` (HSL: 0 0% 98%)

- **Muted**: 
  - Light mode: `#F5F5F5` (HSL: 0 0% 96.1%)
  - Dark mode: `#262626` (HSL: 0 0% 14.9%)

- **Muted Foreground**: 
  - Light mode: `#737373` (HSL: 0 0% 45.1%)
  - Dark mode: `#A3A3A3` (HSL: 0 0% 63.9%)

### Data Visualization Colors

Specially selected to be distinguishable in both light and dark modes, and to be colorblind-friendly:

- Chart 1: `#F97316` (light) / `#3B82F6` (dark)
- Chart 2: `#14B8A6` (light) / `#34D399` (dark)
- Chart 3: `#0F172A` (light) / `#F97316` (dark)
- Chart 4: `#EAB308` (light) / `#A855F7` (dark)
- Chart 5: `#F43F5E` (light) / `#EC4899` (dark)

## Typography

We use a type system that balances professionalism with readability for financial data and analytics.

### Font Family

- **Primary Font**: "Inter", sans-serif
- **Fallback**: Arial, Helvetica, sans-serif
- **Monospace**: "JetBrains Mono", monospace (for code or financial data that benefits from equal-width characters)

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

- **Tight**: 1.25
- **Normal**: 1.5
- **Relaxed**: 1.75

## Spacing & Layout

Consistent spacing creates visual rhythm and helps users understand the relationships between elements.

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

### Layout

- **Content width**: Max 1400px for dashboard and content areas
- **Sidebar width**: 250px
- **Containers**: Centered with padding of 2rem in most cases
- **Grid system**: 12-column grid for complex layouts

### Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## Components

Our component library is designed to be highly reusable, accessible, and consistent across the application. See the components directory for full documentation of each component.

### Core Components

- **Button**: Primary, secondary, outline, ghost, and destructive variants
- **Card**: For containing content with consistent styling
- **Input**: Text inputs with validation states
- **Select**: For selection from options
- **Switch**: For toggles
- **Checkbox**: For multiple selections
- **Radio**: For single selections
- **Table**: For data display with sorting and pagination
- **Modal/Dialog**: For focused interactions
- **Tabs**: For switching between related content
- **Alert**: For notifications (info, success, warning, error)
- **Badge**: For status indicators
- **Toast**: For temporary notifications
- **Dropdown Menu**: For contextual actions
- **Pagination**: For navigating through multi-page content
- **Progress**: For showing completion status
- **File Upload**: Specialized for document uploading

### Specialized Components

- **Financial Data Table**: Enhanced table with sorting, filtering for financial data
- **Chart Components**: Line, bar, pie charts for financial visualization
- **Document Viewer**: For viewing uploaded financial documents
- **Analytics Dashboard**: Layout components for data visualization
- **Portfolio Cards**: For displaying investment portfolios
- **Comparison Tool**: For comparing financial documents

## Accessibility

The design system prioritizes accessibility to ensure that all users can effectively use the application.

### Standards Compliance

- Follows WCAG 2.1 AA standards
- Components tested with screen readers
- Keyboard navigable interfaces
- Sufficient color contrast (minimum 4.5:1 for normal text)

### Accessibility Features

- Focus states for all interactive elements
- Appropriate ARIA attributes
- Text alternatives for non-text content
- Color is not the only visual means of conveying information
- Resizable text without loss of functionality

## Implementation Guidelines

### Using the Design System

1. Import the core CSS:
   ```js
   import '@/design-system/styles/globals.css';
   ```

2. Use the component library:
   ```jsx
   import { Button, Card, Input } from '@/design-system/components';
   ```

3. Utilize the utility functions:
   ```jsx
   import { cn } from '@/design-system/utils';
   ```

### CSS Variables

All design tokens are available as CSS variables, allowing for consistent application and theming.

Example usage:
```css
.custom-element {
  color: var(--primary);
  background-color: var(--background);
  border-radius: var(--radius);
}
```

### Adding New Components

1. Follow the existing patterns and file structure
2. Ensure components are accessible
3. Include comprehensive documentation
4. Add appropriate tests
5. Include usage examples

## Usage Examples

Examples of how to use the components in different contexts can be found in the `/examples` directory. Here are some common patterns:

### Basic Form
```jsx
<Card>
  <CardHeader>
    <CardTitle>Account Details</CardTitle>
    <CardDescription>Update your account information</CardDescription>
  </CardHeader>
  <CardContent>
    <form>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Your name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Your email" />
        </div>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  </CardContent>
</Card>
```

### Dashboard Section
```jsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$45,231.89</div>
    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
  </CardContent>
</Card>
```