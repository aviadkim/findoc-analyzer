# RAG System Tests

This directory contains tests for the RAG (Retrieval-Augmented Generation) system.

## Running the Tests

To run the tests, use the following command:

```bash
python test_rag_system.py --pdf path/to/your/pdf/file.pdf
```

If you don't specify a PDF file, the test will look for sample PDF files in this directory.

## Sample Files

Place sample PDF files in this directory for testing. The following types of financial documents are recommended for testing:

1. Portfolio statements
2. Bank statements
3. Annual reports
4. Quarterly reports
5. Interactive Brokers statements

## Test Coverage

The tests cover the following functionality:

1. Local RAG agent testing
2. ISIN extraction
3. API endpoint testing:
   - Health endpoint
   - RAG process endpoint
   - RAG query endpoint

## Expected Results

The tests should output information about the document processing and query results. A successful test will show:

1. Extracted ISINs
2. Document type identification
3. Financial data extraction
4. Query response
