# Portfolio Visualization Guide

This guide explains how to use the portfolio visualization components to display interactive charts based on extracted securities data.

## Overview

The portfolio visualization system includes several components:

1. **PortfolioVisualizationDashboard** - Main component that integrates all visualizations in a tabbed interface
2. **AssetAllocationChart** - Donut/pie chart showing allocation by asset class
3. **TopHoldingsChart** - Bar chart showing top securities by value
4. **CurrencyDistributionChart** - Pie chart showing portfolio allocation by currency
5. **SectorBreakdownChart** - Bar chart showing allocation by industry sector
6. **PerformanceChart** - Line chart showing portfolio performance over time (if historical data is available)

## Integration

### 1. Required Dependencies

The visualization components use:
- `react-chartjs-2` - Chart.js wrapper for React
- `chart.js` - Underlying charting library

### 2. Basic Usage

Import the main dashboard component:

```jsx
import { PortfolioVisualizationDashboard } from '../components/portfolio';

// Then use it in your component
function PortfolioPage({ portfolioId }) {
  const [portfolio, setPortfolio] = useState(null);
  const [securities, setSecurities] = useState([]);
  
  // Fetch portfolio and securities data
  useEffect(() => {
    // Implementation...
  }, [portfolioId]);
  
  return (
    <div>
      <h1>Portfolio Analysis</h1>
      
      {portfolio && securities.length > 0 && (
        <PortfolioVisualizationDashboard 
          portfolio={portfolio} 
          securities={securities} 
        />
      )}
    </div>
  );
}
```

### 3. Data Format

The visualization components expect data in the following format:

#### Portfolio Object:
```javascript
{
  id: 'portfolio-123',
  name: 'My Portfolio',
  // Other metadata
}
```

#### Securities Array:
```javascript
[
  {
    isin: 'US0378331005',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    assetClass: 'Equity',    // For asset allocation chart
    sector: 'Technology',    // For sector breakdown chart
    region: 'North America', // Optional - for geographic visualization
    currency: 'USD',         // For currency distribution chart
    marketValue: 250000,     // For all charts (required)
    quantity: 1200,          // Optional
    price: 208.33            // Optional
  },
  // More securities...
]
```

### 4. Using Individual Chart Components

You can use each chart component individually:

```jsx
import { 
  AssetAllocationChart, 
  TopHoldingsChart,
  CurrencyDistributionChart,
  SectorBreakdownChart 
} from '../components/portfolio';

// Then use them in your component
function CustomPortfolioView({ assetAllocation, topHoldings, currencies, sectors }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-medium mb-4">Asset Allocation</h3>
        <AssetAllocationChart data={assetAllocation} />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-medium mb-4">Top Holdings</h3>
        <TopHoldingsChart data={topHoldings} />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-medium mb-4">Currency Distribution</h3>
        <CurrencyDistributionChart data={currencies} />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-medium mb-4">Sector Breakdown</h3>
        <SectorBreakdownChart data={sectors} />
      </div>
    </div>
  );
}
```

## Component Features

### PortfolioVisualizationDashboard

- Tabbed interface to switch between different visualizations
- Summary cards at the top of each view
- Loading state handling
- Responsive design for mobile and desktop

### AssetAllocationChart

- Interactive donut chart with percentage labels
- Color-coded asset classes
- Toggleable legend
- Detailed breakdown table with values and percentages

### TopHoldingsChart

- Horizontal bar chart for top holdings
- Configurable to show top 5, 10, 15, or 20 holdings
- Detailed tooltips with holding information
- Tabular view with value and percentage breakdown

### CurrencyDistributionChart

- Pie chart showing currency distribution
- Color-coded by currency
- Detailed breakdown with currency names and symbols
- Percentage and absolute value display

### SectorBreakdownChart

- Toggle between vertical and horizontal bar views
- Option to show top 10 sectors or all sectors
- Detailed tooltips and data table
- Percentage contribution to overall portfolio

## Custom Styling

All components use Tailwind CSS classes for styling. You can customize the appearance by:

1. Overriding the CSS classes used in the components
2. Passing custom color schemes to the charts
3. Modifying the Chart.js options in each component

## Example

See `DevDocs/frontend/examples/portfolio-visualization-example.js` for a complete usage example.