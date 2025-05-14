# Accessibility Guidelines for FinDoc Analyzer

This document provides comprehensive accessibility guidelines to ensure the FinDoc Analyzer application is usable by everyone, including people with disabilities.

## Table of Contents

1. [Introduction](#introduction)
2. [Standards Compliance](#standards-compliance)
3. [Principles](#principles)
4. [Color and Contrast](#color-and-contrast)
5. [Typography and Readability](#typography-and-readability)
6. [Keyboard Navigation](#keyboard-navigation)
7. [Screen Reader Support](#screen-reader-support)
8. [Focus Management](#focus-management)
9. [Form Inputs](#form-inputs)
10. [Interactive Elements](#interactive-elements)
11. [Financial Data Specific Guidelines](#financial-data-specific-guidelines)
12. [Testing](#testing)

## Introduction

Accessibility is a fundamental aspect of FinDoc Analyzer's design system. As a financial application handling important data and documents, it's crucial that all users can access, understand, and use the interface effectively, regardless of their abilities or the technologies they use.

## Standards Compliance

FinDoc Analyzer aims to comply with:

- [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/) at minimum
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) specifications for rich internet applications
- [Section 508](https://www.section508.gov/) requirements for federal agencies

## Principles

Our accessibility approach is guided by the four principles of WCAG:

1. **Perceivable**: Information and user interface components must be presentable to users in ways they can perceive.
2. **Operable**: User interface components and navigation must be operable by all users.
3. **Understandable**: Information and the operation of the user interface must be understandable.
4. **Robust**: Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies.

## Color and Contrast

### Contrast Requirements
- Text and interactive elements must maintain a contrast ratio of at least 4.5:1 against their background
- Large text (18pt+) must maintain a contrast ratio of at least 3:1
- UI components and graphical objects must maintain a contrast ratio of at least 3:1 against adjacent colors

### Implementation
- Use the built-in design system colors, which have been tested for contrast
- For custom colors, use tools like [Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify compliance
- Ensure charts and data visualizations meet contrast requirements
- Provide high-contrast mode option for users who need additional contrast

### Do's and Don'ts

✅ Do:
- Use the color variables defined in the design system
- Test your components in both light and dark modes
- Use tools to verify contrast ratios

❌ Don't:
- Use color as the only means of conveying information
- Override the design system's color tokens without testing for contrast
- Use low-contrast text or UI elements

## Typography and Readability

### Font Choice
- Use the Inter font family, which is designed for excellent readability on screens
- Ensure text can be resized up to 200% without loss of content or functionality

### Text Styling
- Maintain a minimum font size of 16px for body text
- Use appropriate line heights (at least 1.5 for body text)
- Ensure sufficient spacing between paragraphs and sections
- Use proper heading hierarchy (H1 through H6) to structure content

### Implementation

```jsx
// Proper heading hierarchy example
<h1 className="text-4xl font-semibold">Dashboard</h1>
<section>
  <h2 className="text-2xl font-semibold">Portfolio Summary</h2>
  {/* Content */}
  <h3 className="text-xl font-semibold">Asset Allocation</h3>
  {/* Content */}
</section>
```

## Keyboard Navigation

### Requirements
- All interactive elements must be navigable and operable using keyboard only
- Focus order should follow a logical sequence
- Focus states must be visible and meet contrast requirements
- Avoid keyboard traps where focus cannot exit a component

### Implementation
- Use native HTML elements when possible (`<button>`, `<a>`, etc.)
- Add `tabIndex="0"` only when creating custom interactive elements
- Use appropriate ARIA attributes for complex widgets
- Implement keyboard shortcuts for common actions (with documentation)

### Focus Styles
The design system includes visible focus styles that:
- Are distinctive and easily perceivable
- Meet contrast requirements
- Appear consistently across all interactive elements

```css
/* Focus styles are defined in the design system */
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

## Screen Reader Support

### Semantic HTML
- Use the most appropriate HTML elements for their semantic meaning
- Maintain a logical document structure
- Use landmark regions to help users navigate the page

### ARIA Attributes
- Add ARIA labels, roles, and properties when native HTML semantics are insufficient
- Follow the "first rule of ARIA": don't use ARIA if a native HTML element exists
- Update ARIA attributes dynamically as UI changes

### Example Implementation

```jsx
// Good example with semantic HTML and ARIA
<nav aria-label="Main Navigation">
  <ul>
    <li><a href="/" aria-current="page">Dashboard</a></li>
    <li><a href="/documents">Documents</a></li>
  </ul>
</nav>

<main>
  <h1>Financial Dashboard</h1>
  
  {/* Use aria-live for updating content */}
  <div aria-live="polite" aria-atomic="true">
    {/* Content that updates dynamically */}
  </div>

  <button 
    aria-expanded={isExpanded} 
    aria-controls="details-panel"
    onClick={toggleExpand}
  >
    {isExpanded ? "Hide Details" : "Show Details"}
  </button>
  
  <div id="details-panel" hidden={!isExpanded}>
    {/* Panel content */}
  </div>
</main>
```

## Focus Management

### When to Manage Focus
- After page navigation
- When opening/closing dialogs, modals, or drawers
- After significant content changes
- After form submissions or errors
- When deleting or adding items to a list

### Implementation

```jsx
// Example of focus management with a modal
function Modal({ isOpen, onClose, initialFocusRef, children }) {
  const modalRef = React.useRef(null)
  
  React.useEffect(() => {
    if (isOpen) {
      // Focus the specified element or the modal itself
      const elementToFocus = initialFocusRef?.current || modalRef.current
      elementToFocus?.focus()
      
      // Save previously focused element
      const previousFocus = document.activeElement
      
      return () => {
        // Restore focus when modal closes
        previousFocus?.focus()
      }
    }
  }, [isOpen, initialFocusRef])
  
  // Trap focus within the modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
    // Additional focus trap logic
  }
  
  if (!isOpen) return null
  
  return (
    <div 
      ref={modalRef}
      role="dialog" 
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}
```

## Form Inputs

### Labeling
- Every input must have a visible, associated label
- Use explicit associations with `for`/`id` attributes
- Placeholder text is not a substitute for labels

### Error Messages
- Error messages must be programmatically associated with inputs
- Use `aria-describedby` to connect inputs with error messages
- Make error states perceivable through multiple means (color, icon, text)

### Example Implementation

```jsx
// Good form input implementation
<div className="form-group">
  <Label htmlFor="accountNumber">Account Number</Label>
  <Input 
    id="accountNumber" 
    name="accountNumber"
    type="text"
    aria-invalid={errors.accountNumber ? "true" : "false"}
    aria-describedby={errors.accountNumber ? "accountNumber-error" : undefined}
  />
  {errors.accountNumber && (
    <p 
      id="accountNumber-error" 
      className="text-destructive text-sm mt-1"
    >
      {errors.accountNumber}
    </p>
  )}
</div>
```

## Interactive Elements

### Buttons
- Use proper HTML button elements for actions
- Include descriptive text that indicates what the button does
- Add aria-label when button has icon only
- Ensure proper size for touch targets (at least 44x44px)

### Links
- Use proper HTML anchor tags for navigation
- Make link text descriptive and unique
- Avoid generic link text like "click here" or "read more"
- Use `aria-current` for indicating current page/section

### Custom Controls
- Custom controls should:
  - Have appropriate ARIA roles
  - Be keyboard operable
  - Announce state changes to screen readers
  - Follow established design patterns

### Example Implementation

```jsx
// Good buttons example
<Button onClick={saveDocument}>Save Document</Button>

// Icon button with aria-label
<Button 
  variant="icon" 
  aria-label="Delete document"
  onClick={deleteDocument}
>
  <TrashIcon />
</Button>

// Good link example
<Link href="/documents/financial-report-2023">
  Financial Report 2023
</Link>

// Bad link example - avoid this
<Link href="/documents/financial-report-2023">
  Click here
</Link>
```

## Financial Data Specific Guidelines

### Numeric Data
- Use tabular numeric formatting for consistent digit alignment
- Include appropriate units (%, $, etc.)
- Format large numbers with appropriate separators
- Provide context for financial figures

### Tables
- Use proper HTML table markup with headers
- Include captions and summaries for complex tables
- Associate data cells with headers using proper markup
- Ensure tables can be navigated with keyboard

### Data Visualizations
- Provide multiple ways to access data (chart + table)
- Use patterns or textures in addition to color
- Include descriptive alt text for charts
- Add detailed descriptions for complex visualizations

### Example Implementation

```jsx
// Good financial data table
<table>
  <caption>Portfolio Holdings as of June 30, 2023</caption>
  <thead>
    <tr>
      <th scope="col">Security</th>
      <th scope="col">Quantity</th>
      <th scope="col">Price</th>
      <th scope="col">Value</th>
      <th scope="col">% of Portfolio</th>
    </tr>
  </thead>
  <tbody>
    {holdings.map(holding => (
      <tr key={holding.id}>
        <th scope="row">{holding.name}</th>
        <td className="tabular-nums">{holding.quantity.toLocaleString()}</td>
        <td className="tabular-nums">{formatCurrency(holding.price)}</td>
        <td className="tabular-nums">{formatCurrency(holding.value)}</td>
        <td className="tabular-nums">{formatPercentage(holding.percentage)}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Testing

### Automated Testing
- Use tools like Axe, Lighthouse, and WAVE to identify basic accessibility issues
- Integrate accessibility tests into the CI/CD pipeline
- Set up automated tests for keyboard navigation and focus management

### Manual Testing
- Test with keyboard only (no mouse)
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test with high contrast mode and zoom
- Test with reduced motion preferences

### User Testing
- Conduct testing with users who have disabilities
- Include users with various assistive technologies
- Address feedback and make continuous improvements

## Resources

- [WebAIM: Web Accessibility In Mind](https://webaim.org/)
- [The A11Y Project](https://www.a11yproject.com/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)
- [Deque University](https://dequeuniversity.com/)