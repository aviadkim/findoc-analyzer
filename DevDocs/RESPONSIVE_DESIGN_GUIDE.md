# FinDoc Analyzer Responsive Design Framework

This guide outlines the responsive design framework implemented in the FinDoc Analyzer application to ensure consistent display and functionality across devices of all sizes - from mobile phones to large desktop monitors.

## Table of Contents

1. [Breakpoints](#breakpoints)
2. [Core Components](#core-components)
3. [Utility Classes](#utility-classes)
4. [Best Practices](#best-practices)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)

## Breakpoints

The framework uses a mobile-first approach with the following standard breakpoints:

| Breakpoint | Size (px) | Description |
|------------|-----------|-------------|
| `xs`       | 360px     | Extra small devices (phones) |
| `sm`       | 640px     | Small devices (large phones, small tablets) |
| `md`       | 768px     | Medium devices (tablets) |
| `lg`       | 1024px    | Large devices (desktops) |
| `xl`       | 1280px    | Extra large devices (large desktops) |
| `2xl`      | 1536px    | Extra extra large devices |

These breakpoints are defined in `tailwind.config.ts` and consistently used throughout the application.

## Core Components

### Layout Components

Our framework provides several responsive layout components:

#### Container
Provides a standard container with responsive padding and max-width constraints based on screen size.

```tsx
<Container>
  Content goes here
</Container>

// With fluid option (full width)
<Container fluid>
  Full width content
</Container>

// With specified max width
<Container maxWidth="md">
  Medium container
</Container>
```

#### Grid
A responsive grid system for creating layouts with a specified number of columns at different breakpoints.

```tsx
// Simple grid with 1 column on mobile, 3 columns on desktop
<Grid cols={{ xs: 1, md: 3 }} gap={4}>
  <div>Grid Item 1</div>
  <div>Grid Item 2</div>
  <div>Grid Item 3</div>
</Grid>
```

#### Flex
A responsive flex container with properties that can change at different breakpoints.

```tsx
<Flex 
  direction={{ xs: 'col', md: 'row' }}
  justify="between"
  align="center"
  gap={4}
>
  <div>Flex Item 1</div>
  <div>Flex Item 2</div>
</Flex>
```

#### ResponsiveStack
Stacks items either horizontally or vertically based on screen size.

```tsx
<ResponsiveStack 
  direction={{ xs: 'vertical', md: 'horizontal' }}
  spacing={4}
  align="center"
>
  <div>Item 1</div>
  <div>Item 2</div>
</ResponsiveStack>
```

#### Hidden
Conditionally hides elements based on screen size.

```tsx
// Hide on mobile
<Hidden below="md">
  This content only appears on tablets and larger devices
</Hidden>

// Hide on desktop
<Hidden above="lg">
  This content only appears on tablets and smaller devices
</Hidden>
```

#### ResponsiveImage
A wrapper around Next.js Image component with additional responsive features.

```tsx
<ResponsiveImage
  src="/path/to/image.jpg"
  alt="Description"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  rounded="md"
/>
```

## Utility Classes

The framework includes responsive utility classes in `globals.css` for common responsive patterns:

### Spacing Classes

```css
/* Responsive padding */
.p-responsive {
  @apply p-4 md:p-6 lg:p-8;
}

/* Responsive margins */
.m-responsive {
  @apply m-4 md:m-6 lg:m-8;
}
```

### Text Classes

```css
/* Responsive text sizes */
.text-responsive {
  @apply text-sm md:text-base lg:text-lg;
}
```

### Visibility Classes

```css
/* Responsive visibility */
.mobile-only {
  @apply md:hidden;
}

.tablet-up {
  @apply hidden md:block;
}

.desktop-up {
  @apply hidden lg:block;
}
```

### Grid Classes

```css
/* Responsive grids */
.grid-responsive-2 {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6;
}

.grid-responsive-3 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6;
}
```

## Best Practices

1. **Mobile First**: Always design for mobile first, then enhance for larger screens.

2. **Use Framework Components**: Prefer using the provided layout components instead of writing custom responsive layouts.

3. **Test All Breakpoints**: Always test your UI on all breakpoints (xs, sm, md, lg, xl, 2xl).

4. **Use Responsive Hooks**: For complex responsive logic, use the `useResponsive` hook.

5. **Avoid Fixed Dimensions**: Use relative units (%, rem, em) and responsive Tailwind classes instead of fixed pixel dimensions when possible.

6. **Keep Touch Targets Large**: Ensure all interactive elements are at least 44px × 44px on mobile for usability.

7. **Be Conscious of Content Length**: Be mindful of how content like headings and paragraphs will display on smaller screens.

## Usage Examples

### Responsive Page Layout

```tsx
<div className="min-h-screen">
  <Header />
  <Container className="py-8">
    <Grid cols={{ xs: 1, lg: 3 }} gap={6}>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Main Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-responsive">
              This content will resize based on screen size
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Hidden below="md">
          <Card>
            <CardHeader>
              <CardTitle>Sidebar</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This sidebar is hidden on mobile</p>
            </CardContent>
          </Card>
        </Hidden>
      </div>
    </Grid>
  </Container>
  <Footer />
</div>
```

### Responsive Form

```tsx
<form className="form-responsive">
  <div className="grid-responsive-2">
    <div className="space-y-2">
      <label htmlFor="firstName">First Name</label>
      <Input id="firstName" name="firstName" />
    </div>
    <div className="space-y-2">
      <label htmlFor="lastName">Last Name</label>
      <Input id="lastName" name="lastName" />
    </div>
  </div>
  <div className="mt-4">
    <label htmlFor="email">Email</label>
    <Input id="email" name="email" type="email" />
  </div>
  <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Submit</Button>
  </div>
</form>
```

### Using the Responsive Hook

```tsx
import { useResponsive } from '@/lib/hooks/useResponsive';

function ResponsiveComponent() {
  const responsive = useResponsive();
  
  return (
    <div>
      {responsive.isMobile ? (
        <MobileView />
      ) : responsive.isTablet ? (
        <TabletView />
      ) : (
        <DesktopView />
      )}
      
      {responsive.below('lg') && (
        <div>This only appears below the lg breakpoint</div>
      )}
    </div>
  );
}
```

## Testing

To test the framework across multiple device sizes, use the `/responsive-demo` page, which showcases all responsive components and utilities in action.

You can also use tools like Playwright to run automated tests on different viewport sizes:

```ts
// Example Playwright test with different viewport sizes
test.describe('Responsive design tests', () => {
  test('mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 8
    await page.goto('/some-page');
    // Test mobile-specific elements
  });
  
  test('tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/some-page');
    // Test tablet-specific elements
  });
  
  test('desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }); // Desktop
    await page.goto('/some-page');
    // Test desktop-specific elements
  });
});
```

## Additional Resources

- Visit the `/responsive-demo` page to see all responsive components in action
- See the source code in `/components/ui-library/layout` for implementation details
- Consult the Tailwind CSS documentation for additional responsive utilities