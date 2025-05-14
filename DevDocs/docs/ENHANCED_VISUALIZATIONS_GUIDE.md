# FinDoc Analyzer - Enhanced Visualizations Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Drill-Down Chart](#drill-down-chart)
3. [Comparative Visualization](#comparative-visualization)
4. [Performance Tracking](#performance-tracking)
5. [Document Comparison](#document-comparison)
6. [Enhanced ISIN Detection](#enhanced-isin-detection)
7. [Developer Integration Guide](#developer-integration-guide)

## Introduction

The FinDoc Analyzer now features enhanced visualization capabilities to help you gain deeper insights from your financial documents. This guide provides an overview of these new features and how to use them effectively.

## Drill-Down Chart

![Drill-Down Chart](assets/drilldown-chart.png)

The Drill-Down Chart allows you to explore hierarchical data in your financial documents by clicking on chart segments to view deeper levels of detail.

### Key Features

- **Interactive Exploration**: Click on any segment to drill down into its sub-categories
- **Breadcrumb Navigation**: Easily track your navigation path and return to previous levels
- **Multiple Chart Types**: View data as a doughnut chart, pie chart, or horizontal bar chart
- **Percentage Display**: See values and percentages for each segment

### How to Use

1. Upload a financial document containing hierarchical data (e.g., portfolio allocation)
2. Navigate to the "Visualizations" tab
3. The chart will display top-level categories of your financial data
4. Click on any segment to drill down into its sub-components
5. Use the back arrow or breadcrumb navigation to return to previous levels
6. Change chart types using the icons in the top-right corner

## Comparative Visualization

![Comparative Visualization](assets/comparative-chart.png)

The Comparative Visualization tool allows you to compare multiple financial documents side-by-side, highlighting changes and trends across time periods.

### Key Features

- **Side-by-Side Comparison**: Compare two or more documents in a single view
- **Change Analysis**: See percentage and absolute changes between documents
- **Multiple Views**: Chart, Changes, and Table views for different perspectives
- **Interactive Elements**: Highlight significant changes with visual indicators

### How to Use

1. Upload two or more financial documents (e.g., statements from different time periods)
2. Navigate to the "Comparison" tab
3. Select the documents you want to compare
4. Choose your preferred view:
   - **Chart**: Visual comparison of data across documents
   - **Changes**: Focused view of what has changed between documents
   - **Table**: Detailed tabular comparison of all values

## Performance Tracking

![Performance Tracking](assets/performance-chart.png)

The Performance Tracking visualization allows you to track your portfolio's performance over time with advanced metrics and benchmark comparisons.

### Key Features

- **Multiple Time Periods**: View data across different timeframes (1M, 3M, 6M, 1Y, All)
- **Multiple Views**: Value, Percentage Change, and Asset Allocation
- **Benchmark Comparison**: Compare your portfolio against market indices
- **Performance Metrics**: View key metrics like Total Return, Volatility, Max Drawdown, and Sharpe Ratio

### How to Use

1. Upload financial documents with time-series data
2. Navigate to the "Performance" tab
3. Choose your view mode:
   - **Value**: Absolute value of your portfolio over time
   - **Change**: Percentage change compared to starting point
   - **Allocation**: How your asset allocation has changed over time
4. Select a time period using the timeframe buttons
5. Hover over the chart to see detailed information at specific points in time

## Document Comparison

![Document Comparison](assets/document-comparison.png)

The Document Comparison tool provides a comprehensive way to compare the content of two financial documents, highlighting differences in text, numbers, and tables.

### Key Features

- **Side-by-Side View**: Compare documents in parallel
- **Diff View**: Highlight additions, deletions, and changes
- **Chart View**: Visual comparison of numerical data
- **Table Comparison**: Compare tabular data with highlighted differences

### How to Use

1. Upload two financial documents to compare
2. Navigate to the "Document Comparison" tab
3. Choose your preferred view:
   - **Side-by-Side**: View documents in parallel columns
   - **Diff**: View combined with highlighted differences
   - **Chart**: Visual comparison of numerical data
4. Expand sections (Summary, Holdings, Details, Tables) to focus on specific parts of the documents

## Enhanced ISIN Detection

The FinDoc Analyzer now features advanced ISIN (International Securities Identification Number) detection capabilities to accurately identify and extract financial securities from your documents.

### Key Features

- **Improved Accuracy**: Advanced pattern matching for better ISIN detection
- **Additional Identifiers**: Support for CUSIP and SEDOL alongside ISIN
- **Validation**: Verify the correctness of identified security codes
- **Metadata Enrichment**: Get additional information about detected securities

### How to Use

1. Upload a financial document containing security identifiers
2. Navigate to the "Securities" tab to see extracted identifiers
3. View detailed information about each security
4. Export the list of securities for further analysis

## Developer Integration Guide

Integrating these enhanced visualizations into your own FinDoc Analyzer component is straightforward. Here's a quick guide:

### Drill-Down Chart

```jsx
import { DrilldownChart } from './components/charts';

// Sample data structure
const portfolioData = {
  holdings: [
    { 
      name: "Stocks", 
      value: 250000,
      subHoldings: [
        { name: "Tech Stocks", value: 150000 },
        { name: "Financial Stocks", value: 70000 },
        { name: "Consumer Goods", value: 30000 }
      ]
    },
    { name: "Bonds", value: 150000 },
    { name: "Real Estate", value: 80000 },
    { name: "Cash", value: 20000 }
  ],
  summary: {
    totalValue: "$500,000",
    totalReturn: "+12.5%"
  }
};

// Component implementation
<DrilldownChart 
  data={portfolioData} 
  height={400} 
  initialChartType="doughnut"
/>
```

### Comparative Chart

```jsx
import { ComparativeChart } from './components/charts';

// Sample data structure
const documents = [
  {
    id: "doc1",
    name: "Q4 2024 Portfolio Statement",
    holdings: [
      { name: "Stocks", value: 250000 },
      { name: "Bonds", value: 150000 },
      { name: "Real Estate", value: 80000 },
      { name: "Cash", value: 20000 }
    ],
    summary: {
      totalValue: "$500,000",
      asOfDate: "2024-12-31"
    }
  },
  {
    id: "doc2",
    name: "Q1 2025 Portfolio Statement",
    holdings: [
      { name: "Stocks", value: 280000 },
      { name: "Bonds", value: 130000 },
      { name: "Real Estate", value: 95000 },
      { name: "Cash", value: 15000 }
    ],
    summary: {
      totalValue: "$520,000",
      asOfDate: "2025-03-31"
    }
  }
];

// Component implementation
<ComparativeChart 
  documents={documents} 
  height={400}
  title="Document Comparison"
/>
```

### Performance Chart

```jsx
import { PerformanceChart } from './components/charts';

// Sample data structure
const performanceData = {
  portfolioTimeSeries: {
    dates: ["2025-01-01", "2025-02-01", "2025-03-01", "2025-04-01", "2025-05-01"],
    values: [500000, 510000, 515000, 530000, 522000],
    assetPerformance: {
      "Stocks": [250000, 260000, 265000, 280000, 272000],
      "Bonds": [150000, 149000, 147000, 145000, 143000],
      "Real Estate": [80000, 81000, 83000, 85000, 87000],
      "Cash": [20000, 20000, 20000, 20000, 20000]
    },
    benchmarks: {
      "S&P 500": [100, 102, 103, 106, 104.5],
      "Bonds Index": [100, 99.5, 99, 98.5, 98]
    }
  }
};

// Component implementation
<PerformanceChart 
  data={performanceData} 
  height={400}
  title="Portfolio Performance"
/>
```

### Document Comparison View

```jsx
import DocumentComparisonView from './components/DocumentComparisonView';

<DocumentComparisonView 
  documents={documents} 
  height="800px"
  width="100%"
/>
```

### Enhanced Financial Visualization Component

```jsx
import EnhancedFinancialVisualization from './components/EnhancedFinancialVisualization';

<EnhancedFinancialVisualization 
  data={portfolioData}
  documents={documents} 
  performanceData={performanceData}
  type="portfolio" // or "comparison" or "performance"
/>
```

### Using the ISIN Extractor Service

```python
from services.ISINExtractorService import ISINExtractorService

# Create service
service = ISINExtractorService(cache_dir="./cache")

# Extract ISINs from text
isins = service.extract_isins(document_text)

# Extract all securities
securities = service.extract_securities(document_text)

# Extract and enrich securities with metadata
enriched = service.extract_and_enrich(document_text)
```

---

For more information, please refer to the API documentation or contact the development team.
