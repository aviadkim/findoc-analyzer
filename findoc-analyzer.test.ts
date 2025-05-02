import { shortest } from "@antiwork/shortest";

// Test the navigation and UI rendering
shortest("Navigate to the FinDoc Analyzer application and verify that the sidebar and main content are properly rendered");

// Test the document upload functionality
shortest("Upload a PDF document to the FinDoc Analyzer application", {
  documentPath: "./test-documents/sample-financial-report.pdf"
});

// Test the document processing functionality
shortest("Process a PDF document and verify that the text, tables, and metadata are extracted correctly");

// Test the data extraction and analysis functionality
shortest("Extract financial data from a processed document and verify that the data is correctly analyzed");

// Test the chat functionality
shortest("Ask questions about a processed document and verify that the answers are correct", {
  questions: [
    "What is the total revenue?",
    "What is the profit margin?",
    "What are the main expenses?"
  ]
});

// Test the document comparison functionality
shortest("Compare two financial documents and identify the differences", {
  document1: "./test-documents/financial-report-2022.pdf",
  document2: "./test-documents/financial-report-2023.pdf"
});

// Test the feedback functionality
shortest("Submit feedback about the FinDoc Analyzer application", {
  rating: 4,
  feedback: "The application is very useful, but the UI could be improved."
});

// Test the settings functionality
shortest("Change the settings of the FinDoc Analyzer application", {
  settings: {
    theme: "dark",
    language: "English",
    notifications: "enabled"
  }
});

// Test the error handling
shortest("Test error handling when uploading an invalid document", {
  documentPath: "./test-documents/invalid-document.txt"
});

// Test the performance
shortest("Test the performance of the FinDoc Analyzer application when processing a large document", {
  documentPath: "./test-documents/large-financial-report.pdf"
});
