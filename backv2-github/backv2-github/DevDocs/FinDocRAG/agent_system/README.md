# Multi-Agent System for Financial Document Processing

This module provides a sophisticated multi-agent system for financial document processing, with specialized agents for different aspects of the processing pipeline.

## Architecture

The multi-agent system consists of the following components:

### 1. Base Agent Framework

- **BaseAgent**: Abstract base class that defines the common interface for all agents
- **LlmAgent**: Base class for LLM-powered agents that use the Gemini model

### 2. Specialized Agents

- **Document Analyzer Agent**: Analyzes document structure and extracts raw data
- **Table Understanding Agent**: Analyzes complex table structures
- **Securities Extractor Agent**: Extracts and normalizes securities information
- **Financial Reasoner Agent**: Validates financial data for consistency and accuracy

### 3. Coordinator Agent

- **Coordinator Agent**: Orchestrates the multi-agent system and manages the workflow

## Agent Communication

The agents communicate through a shared state managed by the Coordinator Agent. Each agent processes input data and produces output that can be used by other agents.

## Usage

### Running the Multi-Agent System

To run the multi-agent system, use the `run_enhanced_agent_system.py` script:

```bash
python run_enhanced_agent_system.py <document_path> --output-dir <output_dir> [--debug] [--api-key <api_key>]
```

Or use the PowerShell script:

```powershell
.\run-enhanced-agent-system.ps1 -DocumentPath <document_path> -OutputDir <output_dir> [-Debug] [-ApiKey <api_key>]
```

### Parameters

- `document_path`: Path to the financial document to process (use "sample" to create a sample document)
- `--output-dir`: Directory to save output files (default: "agent_output")
- `--debug`: Enable debug mode
- `--api-key`: API key for Gemini model (optional)

### Example

```bash
python run_enhanced_agent_system.py sample --output-dir agent_output --debug
```

This will create a sample Messos portfolio statement and process it with the multi-agent system.

## Agent Workflow

1. **Document Analyzer Agent**: Analyzes the document structure and extracts raw data
2. **Table Understanding Agent**: Analyzes table structures and identifies column types
3. **Securities Extractor Agent**: Extracts securities information from tables and text
4. **Financial Reasoner Agent**: Validates the extracted securities for consistency and accuracy

## Implementation Details

### Document Analyzer Agent

The Document Analyzer Agent analyzes the document structure and extracts raw data:

- Extracts text from the document
- Identifies tables in the document
- Determines the document type (portfolio statement, transaction statement, etc.)
- Extracts metadata (date, client info, etc.)

### Table Understanding Agent

The Table Understanding Agent analyzes complex table structures:

- Identifies table type (portfolio holdings, price list, transaction list, etc.)
- Identifies header and footer rows
- Identifies column types (ISIN, security name, quantity, price, etc.)
- Identifies security rows

### Securities Extractor Agent

The Securities Extractor Agent extracts and normalizes securities information:

- Extracts securities from tables
- Extracts securities from text
- Merges securities from different sources
- Normalizes security fields (numeric values, percentages, etc.)

### Financial Reasoner Agent

The Financial Reasoner Agent validates financial data for consistency and accuracy:

- Verifies that percentages add up to 100% (or close to it)
- Verifies that values match their weights
- Checks for inconsistencies in numeric values
- Identifies and corrects errors in the data

## Requirements

- Python 3.7+
- pandas
- numpy
- tabulate
- PyMuPDF (fitz)
- fpdf (for creating sample documents)
- Google Generative AI Python SDK (for Gemini model)

## Installation

```bash
pip install pandas numpy tabulate pymupdf fpdf google-generativeai
```

## API Key

The system uses the Gemini model for LLM-powered agents. You can provide an API key in the following ways:

1. Pass it as a command-line argument: `--api-key <api_key>`
2. Set it as an environment variable: `GOOGLE_API_KEY` or `OPENROUTER_API_KEY`

If no API key is provided, the system will use a default OpenRouter API key.
