# Messos PDF Processing Demo

This document provides instructions for demonstrating the processing of the messos PDF with the Google Agent technologies.

## Overview

The messos PDF is a financial document containing 41 ISINs and various financial data. The Google Agent technologies can extract this data, analyze it, and answer questions about it.

## Prerequisites

- Python 3.10 or higher
- Required dependencies installed (see README-SETUP.md)
- Gemini API key configured in the `.env` file
- messos.pdf file available in the project

## Running the Demo

1. Make sure you have set up the development environment as described in README-SETUP.md.

2. Run the messos PDF processing script:

```bash
# Windows
python process_messos_pdf.py

# Linux/macOS
python3 process_messos_pdf.py
```

3. The script will:
   - Find the messos.pdf file
   - Process it with the Document Processing Agent
   - Analyze the data with the Financial Analysis Agent
   - Display a summary of the extracted data
   - Allow you to ask questions about the data

## Example Questions

You can ask various questions about the messos PDF, such as:

1. **What is the total portfolio value?**
   - The system will extract the total portfolio value from the document and provide it in the appropriate currency.

2. **Which securities have the highest value?**
   - The system will analyze the securities and identify those with the highest value.

3. **What is the asset allocation?**
   - The system will provide the asset allocation percentages extracted from the document.

4. **How diversified is my portfolio?**
   - The system will calculate a diversification score and provide an assessment of the portfolio's diversification.

5. **What recommendations do you have for my portfolio?**
   - The system will analyze the portfolio and provide actionable recommendations based on the analysis.

## What's Happening Behind the Scenes

When you run the demo, the following agents are working together:

1. **Document Processing Agent**:
   - Extracts text, tables, and financial data from the messos PDF
   - Identifies all 41 ISINs in the document
   - Extracts security details for each ISIN (name, quantity, value)
   - Calculates total portfolio value and asset allocation

2. **Financial Analysis Agent**:
   - Analyzes the portfolio composition based on the extracted data
   - Calculates diversification score
   - Determines risk profile
   - Generates actionable recommendations

3. **Query Agent**:
   - Handles your natural language questions about the document
   - Searches for specific information in the extracted data
   - Provides clear and concise answers

4. **Coordinator Agent**:
   - Orchestrates the specialized agents
   - Routes requests to the appropriate agent
   - Aggregates results from multiple agents
   - Provides a unified response

## Troubleshooting

If you encounter any issues:

1. **Missing Dependencies**:
   - Make sure you have installed all required dependencies:
     ```bash
     pip install -r requirements.txt
     ```

2. **API Key Issues**:
   - Ensure your Gemini API key is correctly set in the `.env` file:
     ```
     GEMINI_API_KEY=your_gemini_api_key
     ```

3. **File Not Found**:
   - If the script cannot find the messos.pdf file, provide the path to the file as an argument:
     ```bash
     python process_messos_pdf.py /path/to/messos.pdf
     ```

4. **Import Errors**:
   - If you see import errors, make sure you're running the script from the correct directory:
     ```bash
     cd backv2-github/DevDocs/FinDocRAG/src/google_agents_integration
     python process_messos_pdf.py
     ```

## Next Steps

After running the demo, you can:

1. **Explore the extracted data**:
   - Check the `results/messos_data.json` file for the complete extracted data

2. **Modify the agents**:
   - Explore the agent implementations in the `agents` directory
   - Customize the agents to extract additional data or answer different questions

3. **Integrate with FinDoc Analyzer**:
   - Follow the instructions in README-SETUP.md to integrate the Google Agent technologies with the existing FinDoc Analyzer
