# FinDoc PDF Processing - Manual Testing Guide

## Overview

This guide provides step-by-step instructions for testing the PDF processing capabilities manually in your web browser. The application is running at http://localhost:9090.

## Step 1: Access the Application

1. Open your web browser (Chrome, Edge, Firefox, etc.)
2. Navigate to: **http://localhost:9090**
3. You should see the FinDoc Analyzer interface with:
   - A blue navigation bar at the top
   - A blue hero section with "PDF Document Processing" title
   - A form for uploading PDF documents on the left
   - A results panel on the right (currently empty)

## Step 2: Process the Sample PDF

1. Locate the "Or Process Sample PDF" button at the bottom of the form
2. Click this button to process the built-in sample PDF (messos.pdf)
3. You should see:
   - The progress bar begin to fill
   - "Processing..." status badge appears
   - After a few seconds, the status changes to "Processed"
   - The results panel will show the extracted text
   - Processing statistics will update with tables, entities, etc.

## Step 3: Explore the Text Tab

1. The Text tab should be active by default after processing
2. You should see:
   - A scrollable text area containing the extracted text from the PDF
   - This text represents all the textual content from the document
3. Scroll through the text to see the full content

## Step 4: Examine Tables

1. Click on the "Tables" tab in the results panel
2. You should see:
   - A dropdown menu to select between different tables
   - The first table displayed by default
3. Use the dropdown to switch between tables if multiple tables were extracted
4. Each table should display:
   - Column headers (if detected)
   - Row data in a formatted table

## Step 5: View Extracted Entities

1. Click on the "Entities" tab in the results panel
2. You should see:
   - Grouped sections for different entity types (security, company, etc.)
   - Each section shows the count of entities of that type
   - Each entity is displayed as a "pill" with its name/value
   - Some entities may have additional properties shown in parentheses
   - A confidence meter shows the extraction confidence

## Step 6: Check Document Metadata

1. Click on the "Metadata" tab in the results panel
2. You should see:
   - A table listing various document properties
   - This may include file name, page count, author, etc.
   - Values for each metadata property

## Step 7: Test with MCP Processing

1. Go back to the form on the left side
2. Select the "Enhanced Processing with MCP" radio button
3. Click the "Or Process Sample PDF" button again
4. You should see:
   - The progress bar filling again
   - After processing completes, check the "Entities" tab
   - There should be more entities with higher confidence scores
   - Different entity types may be detected compared to standard processing

## Step 8: Upload Your Own PDF (Optional)

If you have your own PDF files to test:

1. Click the "Choose File" button in the form
2. Select a PDF file from your computer
3. Click the "Process Document" button
4. Watch the processing progress and explore the results as before

## Expected Results

### Tables Tab
- Should show formatted tables extracted from the document
- Should allow switching between tables if multiple were found
- Tables should have proper headers and aligned columns

### Entities Tab
- Security entities should display ISINs
- Confidence meters should show appropriate confidence levels
- Entities should be grouped by type for easy browsing

### Metadata Tab
- Should show file information such as:
  - File name and type
  - Page count (if available)
  - Author information (if available) 
  - Creation date (if available)

## Troubleshooting

If you encounter any issues:

1. **Application doesn't load**: Make sure the server is running (check terminal for "PDF processing server running" message)

2. **Sample PDF doesn't process**: The system will use the messos.pdf file in the sample-pdfs directory. Ensure this file exists.

3. **Entities not displaying**: Entity extraction depends on MCP capabilities. When using "Enhanced Processing with MCP", more entities should be detected.

4. **Tables not showing properly**: Table extraction can vary based on the PDF structure. The messos.pdf sample should show at least basic tables.

## Testing Different PDF Types

For thorough testing, try processing different types of PDFs:

1. **Financial documents** - Should work best with our system, extracting tables and financial entities
2. **Text-heavy PDFs** - Should extract text well but may have fewer tables
3. **Scanned documents** - May have more limited extraction capabilities
4. **PDFs with complex layouts** - Tests the robustness of our extraction algorithms

---

After completing these tests, you'll have a good understanding of the PDF processing capabilities implemented in the FinDoc Analyzer.