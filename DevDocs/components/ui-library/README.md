# FinDoc UI Component Library

A comprehensive collection of reusable UI components for the FinDoc Analyzer application. This library provides consistent, accessible, and responsive components following the atomic design methodology.

## Overview

The FinDoc UI Component Library is built with:

- **React** and **TypeScript**
- **Tailwind CSS** for styling
- **shadcn/ui** as a UI component foundation
- **Recharts** for data visualization

Components are organized according to atomic design principles:

- **Atoms**: Basic building blocks (Typography, Icons, Badges, etc.)
- **Molecules**: Composite components made of atoms (DataCard, SearchFilter, etc.)
- **Organisms**: Complex components containing multiple molecules (DashboardLayout, DataTable, etc.)
- **Financial**: Domain-specific components for financial analysis (PortfolioSummary, SecuritiesTable, etc.)

## Getting Started

To use the component library in your project:

```tsx
// Import components directly
import { Button, DataCard, PortfolioSummary } from '@/components/ui-library';

// Use components in your JSX
function MyComponent() {
  return (
    <div>
      <DataCard
        title="Total Value"
        value="$125,750.42"
        trend="positive"
        changePercentage={4.36}
      />
      <Button>View Details</Button>
    </div>
  );
}
```

## Demo and Documentation

A complete demo of all components is available at `/ui-components` in the application. This page shows examples of all components with their variants and provides interactive demonstrations.

## Atomic Components

### Atoms

Basic UI building blocks:

- **Typography**: Text elements (headings, paragraphs, etc.)
- **Icon**: SVG icons with consistent styling
- **Badge**: Status indicators and tags

### Molecules

Composite components:

- **DataCard**: Display key metrics with optional trends
- **SearchFilter**: Search and filter interfaces
- **FileUpload**: File upload with drag-and-drop support

### Organisms

Complex UI patterns:

- **DashboardLayout**: Page layout with sections and sidebar
- **DataTable**: Advanced data table with sorting, filtering, and pagination

### Financial Components

Domain-specific components:

- **PortfolioSummary**: Overview of portfolio metrics
- **AssetAllocation**: Visualizations for asset allocation
- **SecuritiesTable**: Table of securities with financial data
- **DocumentAnalytics**: Analysis of financial documents

## Design Principles

All components adhere to these principles:

1. **Consistency**: Using the same visual language across the application
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Responsiveness**: Adapting to different screen sizes
4. **Reusability**: Composable and configurable
5. **Performance**: Optimized for speed and minimal re-renders

## Theming and Customization

Components use CSS variables for theming and support both light and dark modes. The color palette, typography, spacing, and other design tokens are defined in the Tailwind configuration.

```css
/* Example of customizing via CSS variables */
:root {
  --primary: 220 65% 45%;  /* Adjust the primary color */
  --border-radius: 0.5rem; /* Modify border radius */
}
```

## Contribution Guidelines

When adding or modifying components:

1. Follow the atomic design pattern
2. Ensure full TypeScript typing with prop interfaces
3. Maintain responsive design
4. Document component usage with examples
5. Consider accessibility in all aspects of design

## Future Improvements

Planned enhancements:

- Storybook integration for better documentation
- Component testing with Jest and Testing Library
- Animation and transition standardization
- Additional financial-specific visualizations
- Improved focus management for keyboard navigation

## Related Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Recharts Documentation](https://recharts.org/en-US/)