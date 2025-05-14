# FinDoc Analyzer - User Guide

## Version 1.0 (July 3, 2025)

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
   - [Creating an Account](#creating-an-account)
   - [Logging In](#logging-in)
   - [Dashboard Overview](#dashboard-overview)
3. [Working with Documents](#working-with-documents)
   - [Uploading Documents](#uploading-documents)
   - [Viewing Documents](#viewing-documents)
   - [Processing Documents](#processing-documents)
   - [Managing Documents](#managing-documents)
4. [Financial Analysis](#financial-analysis)
   - [Portfolio Analysis](#portfolio-analysis)
   - [Performance Tracking](#performance-tracking)
   - [Allocation Visualization](#allocation-visualization)
   - [Financial Recommendations](#financial-recommendations)
5. [Using Agents](#using-agents)
   - [Available Agents](#available-agents)
   - [Agent Selection](#agent-selection)
   - [Building Agent Pipelines](#building-agent-pipelines)
   - [Executing Agents](#executing-agents)
6. [Data Export](#data-export)
   - [Export Formats](#export-formats)
   - [Export Options](#export-options)
   - [Automated Reports](#automated-reports)
7. [Document Comparison](#document-comparison)
   - [Selecting Documents](#selecting-documents)
   - [Comparison Views](#comparison-views)
   - [Understanding Changes](#understanding-changes)
8. [Customizing Your Experience](#customizing-your-experience)
   - [Theme Settings](#theme-settings)
   - [Dashboard Customization](#dashboard-customization)
   - [Notification Preferences](#notification-preferences)
   - [Accessibility Features](#accessibility-features)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Troubleshooting](#troubleshooting)
11. [Getting Help](#getting-help)

## Introduction

Welcome to FinDoc Analyzer, a comprehensive financial document processing system designed to extract, analyze, and provide insights from your financial documents. This user guide will help you get the most out of the application, whether you're analyzing a single portfolio statement or managing multiple financial documents over time.

FinDoc Analyzer offers:

- **Automated Document Processing**: Extract financial data from PDFs, Excel files, and more
- **Portfolio Analysis**: Gain insights into your financial holdings
- **Performance Tracking**: Monitor your portfolio performance over time
- **Financial Recommendations**: Receive personalized investment advice
- **Document Comparison**: Easily compare multiple financial documents
- **Data Export**: Export your financial data in various formats

## Getting Started

### Creating an Account

1. Navigate to the FinDoc Analyzer website at https://findoc-analyzer.example.com
2. Click the "Sign Up" button in the top-right corner
3. Enter your email address, name, and a secure password
4. Accept the terms of service and privacy policy
5. Click "Create Account"
6. Check your email for a verification link
7. Click the verification link to activate your account

### Logging In

1. Navigate to the FinDoc Analyzer website
2. Click the "Log In" button in the top-right corner
3. Enter your email address and password
4. Click "Log In"
5. For enhanced security, you may be prompted for two-factor authentication if enabled

### Dashboard Overview

After logging in, you'll be taken to your dashboard, which provides an overview of your documents and financial data.

![Dashboard Overview](../assets/images/dashboard-overview.png)

The dashboard is divided into several sections:

1. **Navigation Menu**: Access different parts of the application
2. **Document Statistics**: See how many documents you've uploaded and processed
3. **Recent Documents**: Quick access to your most recent documents
4. **Portfolio Summary**: Overview of your portfolio's value and allocation
5. **Performance Chart**: Visual representation of your portfolio's performance
6. **Action Buttons**: Quick actions for uploading and processing documents

## Working with Documents

### Uploading Documents

To upload a new document:

1. Click the "Upload" button in the top navigation bar
2. Select a file from your computer or drag and drop it into the upload area
3. The supported file types are:
   - PDF (`.pdf`)
   - Excel (`.xlsx`, `.xls`)
   - CSV (`.csv`)
   - Text (`.txt`)
4. Once selected, the file will begin uploading
5. After uploading, you'll be taken to the document details page

**Tips for best results:**
- Ensure your documents are clear and legible
- For scanned documents, use a resolution of at least 300 DPI
- Make sure tables are clearly visible in the document
- For spreadsheets, ensure data is well-structured in tables

### Viewing Documents

To view a document:

1. Go to the "Documents" section in the navigation menu
2. Click on a document in the list
3. The document viewer will open, showing a preview of the document
4. Use the controls at the top of the viewer to:
   - Zoom in and out
   - Navigate between pages
   - Rotate the document
   - Download the original document

The document viewer includes several panels:

- **Preview Panel**: Shows the document content
- **Metadata Panel**: Displays document information
- **Extracted Data Panel**: Shows data extracted from the document
- **Processing Status Panel**: Shows the status of document processing

### Processing Documents

To process a document and extract financial data:

1. View the document you want to process
2. Click the "Process" button in the document viewer
3. Select the appropriate processing options:
   - **Standard Processing**: Uses the default set of agents
   - **Custom Processing**: Allows you to select specific agents
4. Click "Start Processing"
5. The processing status will be shown in real-time
6. Once processing is complete, the extracted data will be displayed

Processing time depends on the document size and complexity, usually ranging from a few seconds to a minute.

### Managing Documents

To manage your documents:

1. Go to the "Documents" section in the navigation menu
2. Use the filters and sorting options to find specific documents:
   - Filter by date, type, status, or content
   - Sort by name, date, status, or size
3. Select one or more documents to perform batch actions:
   - Process multiple documents
   - Download documents
   - Export data
   - Delete documents
4. Use the search bar to find documents by name, content, or extracted data

## Financial Analysis

### Portfolio Analysis

After processing a document containing portfolio information, you can view a detailed analysis:

1. Open a processed document
2. Click the "Portfolio Analysis" tab
3. The portfolio analysis includes:
   - **Holdings Summary**: List of all securities in the portfolio
   - **Asset Allocation**: Breakdown of assets by type
   - **Sector Allocation**: Breakdown of assets by sector
   - **Geographic Allocation**: Breakdown of assets by region
   - **Risk Metrics**: Volatility, Sharpe ratio, and other risk metrics

![Portfolio Analysis](../assets/images/portfolio-analysis.png)

### Performance Tracking

To track portfolio performance over time:

1. Go to the "Performance" section in the navigation menu
2. The performance dashboard shows:
   - **Performance Chart**: Portfolio value over time
   - **Returns Table**: Returns for different time periods
   - **Benchmark Comparison**: Performance compared to selected benchmarks
   - **Contribution Analysis**: Which holdings contributed most to performance
3. Use the time period selector to view different timeframes:
   - 1 Month
   - 3 Months
   - 6 Months
   - 1 Year
   - Year to Date
   - All Time

### Allocation Visualization

To visualize your portfolio allocation:

1. Go to the "Allocation" section in the navigation menu
2. The allocation dashboard shows:
   - **Pie Chart**: Visual breakdown of your portfolio
   - **Treemap**: Alternative visualization of allocation
   - **Bar Chart**: Comparative view of different allocations
3. Use the allocation type selector to view different breakdowns:
   - By Asset Class
   - By Sector
   - By Geography
   - By Currency

![Allocation Visualization](../assets/images/allocation-visualization.png)

### Financial Recommendations

After processing your financial documents, you can get personalized recommendations:

1. Go to the "Recommendations" section in the navigation menu
2. Set your investment profile:
   - Risk tolerance (conservative, moderate, aggressive)
   - Investment goals (growth, income, balanced)
   - Time horizon (short-term, medium-term, long-term)
3. Click "Generate Recommendations"
4. Review the recommendations, which include:
   - **Portfolio Assessment**: Overall evaluation of your portfolio
   - **Diversification Recommendations**: How to better diversify your holdings
   - **Asset Allocation Suggestions**: Recommended changes to your asset allocation
   - **Specific Actions**: Concrete steps to improve your portfolio

## Using Agents

### Available Agents

FinDoc Analyzer uses specialized agents to process and analyze your financial documents. The available agents include:

- **ISINExtractorAgent**: Extracts ISIN codes and security information
- **FinancialTableDetectorAgent**: Detects and extracts tables from documents
- **FinancialDataAnalyzerAgent**: Analyzes extracted financial data
- **DocumentMergeAgent**: Merges data from multiple documents
- **FinancialAdvisorAgent**: Provides investment recommendations
- **DataExportAgent**: Exports data in various formats
- **DocumentComparisonAgent**: Compares multiple financial documents

### Agent Selection

To select which agents to use for document processing:

1. When processing a document, click "Custom Processing"
2. The agent selection screen will appear
3. Select the agents you want to use by checking the boxes
4. Configure agent parameters if needed
5. Click "Apply" to save your selection

![Agent Selection](../assets/images/agent-selection.png)

### Building Agent Pipelines

For more complex document processing, you can build an agent pipeline:

1. Go to the "Agents" section in the navigation menu
2. Click "Create Pipeline"
3. The pipeline builder interface will appear
4. Drag and drop agents from the left panel to the pipeline area
5. Connect agents by drawing lines between them
6. Configure each agent's parameters
7. Save the pipeline with a descriptive name

Pipelines can be reused for processing multiple documents, ensuring consistent results.

### Executing Agents

To execute a specific agent on a document:

1. Open a document
2. Go to the "Agents" tab
3. Select an agent from the list
4. Configure the agent's parameters
5. Click "Execute"
6. The agent will process the document, and the results will be displayed

You can also execute a saved pipeline:

1. Open a document
2. Go to the "Pipelines" tab
3. Select a pipeline from the list
4. Click "Execute Pipeline"
5. The pipeline will process the document, showing progress for each agent

## Data Export

### Export Formats

FinDoc Analyzer supports exporting data in various formats:

- **JSON**: For programmatic access
- **CSV**: For spreadsheet applications
- **Excel**: For detailed spreadsheets with multiple tabs
- **PDF**: For formal reports
- **HTML**: For web-based reports

### Export Options

To export data from a processed document:

1. Open a processed document
2. Click the "Export" button
3. Select the export format
4. Configure export options:
   - **Data to Export**: Select which data to include
   - **Formatting Options**: Configure how the data is formatted
   - **Include Visualizations**: For PDF and HTML exports
   - **Include Analysis**: Include analytical content
5. Click "Export" to generate the file
6. The file will be downloaded to your computer

![Export Options](../assets/images/export-options.png)

### Automated Reports

You can set up automated reports to be generated periodically:

1. Go to the "Reports" section in the navigation menu
2. Click "Create Automated Report"
3. Configure the report:
   - **Report Name**: Descriptive name for the report
   - **Report Type**: Portfolio summary, performance, allocation, etc.
   - **Frequency**: Daily, weekly, monthly, quarterly
   - **Format**: PDF, HTML, Excel, etc.
   - **Delivery Method**: Email, download, or save to account
4. Click "Save" to set up the automated report

## Document Comparison

### Selecting Documents

To compare multiple financial documents:

1. Go to the "Documents" section in the navigation menu
2. Select at least two documents by checking the boxes
3. Click the "Compare" button
4. The comparison tool will open

You can also compare documents directly:

1. Open a document
2. Click the "Compare" button
3. Select another document to compare with
4. The comparison tool will open

### Comparison Views

The comparison tool offers several views:

- **Side by Side**: View documents next to each other
- **Changes Only**: Show only the differences between documents
- **Overlay**: Overlay one document on top of another
- **Timeline**: Show changes over time if comparing multiple documents

Use the view selector at the top of the comparison tool to switch between views.

### Understanding Changes

The comparison tool highlights changes between documents:

- **Added Items**: Highlighted in green
- **Removed Items**: Highlighted in red
- **Changed Values**: Highlighted in yellow
- **Unchanged Items**: Shown in normal text

For portfolio comparisons, the tool provides additional insights:

- **Value Changes**: How security values have changed
- **Allocation Changes**: How allocation percentages have changed
- **New Securities**: Securities added to the portfolio
- **Removed Securities**: Securities removed from the portfolio

![Document Comparison](../assets/images/document-comparison.png)

## Customizing Your Experience

### Theme Settings

To change the application theme:

1. Click your profile picture in the top-right corner
2. Select "Preferences" from the dropdown menu
3. Go to the "Appearance" tab
4. Choose from available themes:
   - Light
   - Dark
   - High Contrast
   - System Default
5. Click "Save" to apply the changes

### Dashboard Customization

To customize your dashboard:

1. Go to the dashboard
2. Click the "Customize" button in the top-right corner
3. The dashboard will enter edit mode
4. Drag and drop widgets to rearrange them
5. Resize widgets by dragging the handles
6. Click the gear icon on a widget to configure it
7. Click "Add Widget" to add new widgets
8. Click "Save Layout" when done

![Dashboard Customization](../assets/images/dashboard-customization.png)

### Notification Preferences

To configure notifications:

1. Click your profile picture in the top-right corner
2. Select "Preferences" from the dropdown menu
3. Go to the "Notifications" tab
4. Configure notification settings:
   - **Email Notifications**: Toggle email notifications
   - **Browser Notifications**: Toggle browser notifications
   - **Notification Types**: Select which events trigger notifications
5. Click "Save" to apply the changes

### Accessibility Features

FinDoc Analyzer includes several accessibility features:

- **High Contrast Mode**: Improves visibility for users with visual impairments
- **Large Text Mode**: Increases text size throughout the application
- **Screen Reader Support**: Optimized for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Reduced Motion**: Reduces animations for users with vestibular disorders

To enable accessibility features:

1. Click your profile picture in the top-right corner
2. Select "Preferences" from the dropdown menu
3. Go to the "Accessibility" tab
4. Enable the desired accessibility features
5. Click "Save" to apply the changes

## Keyboard Shortcuts

FinDoc Analyzer offers keyboard shortcuts for common actions:

### Global Shortcuts

- `Shift + ?`: Show keyboard shortcuts help
- `Alt + D`: Go to Dashboard
- `Alt + U`: Go to Upload
- `Alt + M`: Go to Documents
- `Alt + A`: Go to Agents
- `Alt + P`: Go to Portfolio
- `Alt + S`: Focus search

### Document Viewer Shortcuts

- `Left Arrow`: Previous page
- `Right Arrow`: Next page
- `+`: Zoom in
- `-`: Zoom out
- `0`: Reset zoom
- `R`: Rotate document
- `P`: Process document
- `E`: Export document
- `D`: Download document

### Customizing Shortcuts

To customize keyboard shortcuts:

1. Click your profile picture in the top-right corner
2. Select "Preferences" from the dropdown menu
3. Go to the "Keyboard Shortcuts" tab
4. Click on the shortcut you want to change
5. Press the new key combination
6. Click "Save" to apply the changes

## Troubleshooting

### Common Issues

**Issue**: Document upload fails
- **Solution**: Ensure the file is in a supported format and within the size limit (50MB)
- **Solution**: Check your internet connection
- **Solution**: Try a different browser

**Issue**: Document processing takes too long
- **Solution**: Large or complex documents may take longer to process
- **Solution**: Try processing with fewer agents
- **Solution**: Ensure the document is clear and legible

**Issue**: Extracted data is incorrect
- **Solution**: Ensure the document is clear and tables are well-structured
- **Solution**: Try using a different combination of agents
- **Solution**: For specialized documents, use custom processing

**Issue**: Cannot log in
- **Solution**: Ensure you're using the correct email and password
- **Solution**: Check if your account is verified
- **Solution**: Use the "Forgot Password" option to reset your password

### Error Messages

- **"Invalid File Type"**: The uploaded file is not in a supported format
- **"File Too Large"**: The file exceeds the maximum size limit
- **"Processing Failed"**: The document could not be processed
- **"No Data Found"**: No financial data was found in the document
- **"Agent Execution Error"**: An error occurred during agent execution

## Getting Help

If you need additional help:

- **Documentation**: Visit the Help Center at https://findoc-analyzer.example.com/help
- **FAQ**: Check the Frequently Asked Questions at https://findoc-analyzer.example.com/faq
- **Email Support**: Contact support@findoc-analyzer.example.com
- **Live Chat**: Available during business hours (9am-5pm EST)
- **Video Tutorials**: Available in the Help Center
