# Securities Extraction Feedback System

This document provides details on the securities extraction feedback system, which allows users to report errors or inaccuracies in securities data and helps improve the extraction algorithm over time.

## Table of Contents

1. [Overview](#overview)
2. [User Guide](#user-guide)
3. [Admin Guide](#admin-guide)
4. [Developer Guide](#developer-guide)
5. [Algorithm Improvement Process](#algorithm-improvement-process)

## Overview

The securities extraction feedback system serves two primary purposes:

1. **Capturing User Feedback**: Allows users to report errors or inaccuracies in extracted securities data
2. **Improving the Extraction Algorithm**: Provides mechanisms to use this feedback to enhance extraction accuracy over time

The feedback system consists of:
- **User Interface**: Accessible directly from securities views
- **Admin Dashboard**: For managing and reviewing feedback items
- **Analytics System**: For identifying patterns and improvement opportunities
- **Algorithm Improvement Workflow**: For implementing corrections based on feedback

## User Guide

### Reporting Securities Extraction Errors

1. **Access the Securities Data**:
   - View documents containing securities in the document details page
   - Locate the securities table in the document view

2. **Report an Error**:
   - Each row in the securities table includes a feedback button (⚠️)
   - Click the feedback button on the row with incorrect data
   - A feedback form will open showing the current security information

3. **Fill in the Feedback Form**:
   - Select the error type (e.g., wrong identifier, wrong name, wrong quantity)
   - Enter the correct value
   - Provide a detailed description of the error
   - Optionally specify where in the document the correct data appears
   - Submit the feedback

4. **Confirmation**:
   - You'll receive a confirmation that your feedback has been submitted
   - The feedback will be reviewed by administrators

### Tracking Your Feedback

1. Visit the general feedback page to see a history of all your feedback submissions
2. Each feedback item shows its current status (new, in review, fixed, rejected)
3. You can filter and search through your feedback history

## Admin Guide

### Accessing the Admin Dashboard

1. Navigate to the "Securities Feedback Admin" page from the sidebar
2. The dashboard displays statistics and a list of all feedback items

### Dashboard Features

- **Statistics Cards**: Show counts of total, new, in-review, and fixed feedback items
- **Filter Controls**: Filter feedback by status, error type, date range, or search term
- **Feedback List**: Displays all feedback items matching the current filters
- **Learning Insights**: Shows patterns and improvement opportunities identified from the feedback

### Managing Feedback

1. **Reviewing Feedback**:
   - Click the "View Details" button on any feedback item
   - Review the reported error, suggested correction, and security information
   - Add internal notes about the feedback

2. **Updating Status**:
   - Change the status to "In Review" when you start investigation
   - Change to "Fixed" once the issue has been addressed
   - Change to "Rejected" if the feedback is invalid

3. **Applying Feedback to the Algorithm**:
   - Click the "Apply to Algorithm" button to use the feedback for algorithm improvement
   - The system will update reference data, extraction rules, or other components based on the error type
   - Metrics will track accuracy improvements from the applied feedback

4. **Generating Reports**:
   - Click the "Generate Report" button to create a comprehensive report
   - The report includes statistics, error analysis, and improvement opportunities
   - Reports can be downloaded for sharing with the development team

## Developer Guide

### System Architecture

The securities feedback system consists of these components:

1. **Feedback Collection**: JavaScript-based UI components for capturing feedback
2. **Storage Layer**: Client-side storage (localStorage) for demo, server-side database in production
3. **Analytics Engine**: Processes feedback to identify patterns and improvement opportunities
4. **Algorithm Improvement**: Mechanisms to apply feedback to enhance extraction accuracy

### Files and Components

- `securities-feedback-enhanced.js`: Core functionality for feedback collection and analytics
- `securities-feedback-admin.js`: Admin dashboard functionality
- `securities-feedback-admin.html`: Admin interface
- Associated styles and UI components

### Integration Points

To integrate the feedback system with the securities extraction algorithm:

1. **Extraction Context**: When extracting securities data, capture metadata about the extraction process:
   ```javascript
   window.documentExtractionMetadata = {
     method: 'ocr+table-detection',
     confidence: 0.87,
     processingTime: 1.23,
     documentType: 'investment-statement',
     model: 'financial-v2'
   };
   ```

2. **Position Data**: For enhanced correction, capture position information for each security:
   ```javascript
   window.extractedTextPositions = [
     {
       page: 2,
       table: 1,
       row: 3,
       boundingBox: { x1: 125, y1: 350, x2: 450, y2: 375 }
     },
     // More positions...
   ];
   ```

3. **Algorithm Improvement Hook**: Implement the actual algorithm improvement function:
   ```javascript
   // Replace simulation with actual implementation
   window.securitiesFeedback.applyFeedbackToAlgorithm = function(feedbackId) {
     // Retrieve feedback from database
     // Apply corrections to extraction model/rules
     // Update reference data
     // Track metrics
     return updatedFeedback;
   };
   ```

## Algorithm Improvement Process

The feedback system supports an iterative improvement process:

1. **Collect Feedback**: Users report extraction errors through the UI
2. **Analyze Patterns**: The system identifies common error types and patterns
3. **Prioritize Improvements**: Administrators focus on high-impact issues
4. **Implement Corrections**:
   - Update reference databases (for identifier/name corrections)
   - Enhance extraction rules (for numerical/currency formatting)
   - Improve layout detection (for table structure issues)
   - Fine-tune OCR parameters (for text recognition issues)
5. **Measure Impact**: Track accuracy improvements for each correction
6. **Continuous Learning**: Feed corrections back into training data for model improvements

### Improvement Strategies by Error Type

| Error Type | Improvement Strategy |
|------------|----------------------|
| Wrong Identifier | Update reference database with correct mappings |
| Wrong Name | Enhance name recognition and standardization rules |
| Wrong Type | Improve security type classification logic |
| Wrong Quantity | Fine-tune number extraction and formatting handling |
| Wrong Price | Enhance decimal/thousand separator recognition |
| Wrong Value | Correct calculation formulas and validation rules |
| Wrong Currency | Improve currency symbol and code detection |
| Layout Error | Enhance table structure recognition |
| Duplicate | Improve deduplication logic across multiple tables |

---

For any questions or suggestions about the securities feedback system, please contact the development team.