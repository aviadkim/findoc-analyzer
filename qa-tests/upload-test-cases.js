/**
 * Test Cases for Document Upload
 * 
 * This file contains test cases for testing document upload functionality.
 */

const path = require('path');

// Base directory for test PDFs
const testPdfsDir = path.join(__dirname, 'test-pdfs');

/**
 * Test cases for document upload
 * Each test case includes:
 * - name: Test case name
 * - filePath: Path to the file to upload
 * - question: Question to ask (optional)
 * - expectedResult: Expected result (optional)
 */
const uploadTestCases = [
  // Basic PDF Tests
  {
    name: 'Simple Financial Statement',
    filePath: path.join(testPdfsDir, 'simple', 'investment_portfolio.pdf'),
    question: 'What is the total value of the portfolio?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Bank Statement',
    filePath: path.join(testPdfsDir, 'simple', 'bank_statement.pdf'),
    question: 'What is the closing balance?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Account Statement',
    filePath: path.join(testPdfsDir, 'simple', 'account_statement.pdf'),
    question: 'What is the total value of the account?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  
  // Complex PDF Tests
  {
    name: 'Complex Financial Statement',
    filePath: path.join(testPdfsDir, 'complex', 'complex_portfolio.pdf'),
    question: 'What is the asset allocation?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Multi-Page Document',
    filePath: path.join(testPdfsDir, 'complex', 'multi_page_report.pdf'),
    question: 'What is the total value of the portfolio?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Document with Tables',
    filePath: path.join(testPdfsDir, 'complex', 'tables_document.pdf'),
    question: 'What securities are in the portfolio?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  
  // Edge Case Tests
  {
    name: 'Large PDF',
    filePath: path.join(testPdfsDir, 'edge_cases', 'large_document.pdf'),
    question: 'What is the total value of the portfolio?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Scanned PDF',
    filePath: path.join(testPdfsDir, 'edge_cases', 'scanned_document.pdf'),
    question: 'What is the total value of the portfolio?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Password Protected PDF',
    filePath: path.join(testPdfsDir, 'edge_cases', 'password_protected.pdf'),
    question: null,
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: false,
      chatSuccess: false
    }
  },
  {
    name: 'Corrupted PDF',
    filePath: path.join(testPdfsDir, 'edge_cases', 'corrupted.pdf'),
    question: null,
    expectedResult: {
      uploadSuccess: false,
      processingSuccess: false,
      chatSuccess: false
    }
  },
  {
    name: 'Non-PDF Document',
    filePath: path.join(testPdfsDir, 'edge_cases', 'document.docx'),
    question: null,
    expectedResult: {
      uploadSuccess: false,
      processingSuccess: false,
      chatSuccess: false
    }
  },
  
  // File Size Tests
  {
    name: 'Empty PDF',
    filePath: path.join(testPdfsDir, 'file_size', 'empty.pdf'),
    question: null,
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: false,
      chatSuccess: false
    }
  },
  {
    name: 'Very Small PDF',
    filePath: path.join(testPdfsDir, 'file_size', 'very_small.pdf'),
    question: 'What is in this document?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Very Large PDF',
    filePath: path.join(testPdfsDir, 'file_size', 'very_large.pdf'),
    question: 'What is the document about?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  
  // Content Type Tests
  {
    name: 'Text Only PDF',
    filePath: path.join(testPdfsDir, 'content_type', 'text_only.pdf'),
    question: 'What is the document about?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Tables Only PDF',
    filePath: path.join(testPdfsDir, 'content_type', 'tables_only.pdf'),
    question: 'What information is in the tables?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Images Only PDF',
    filePath: path.join(testPdfsDir, 'content_type', 'images_only.pdf'),
    question: 'What is shown in the images?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Mixed Content PDF',
    filePath: path.join(testPdfsDir, 'content_type', 'mixed_content.pdf'),
    question: 'What is the document about?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  
  // Financial Document Types
  {
    name: 'Annual Report',
    filePath: path.join(testPdfsDir, 'financial', 'annual_report.pdf'),
    question: 'What is the company\'s revenue?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Quarterly Report',
    filePath: path.join(testPdfsDir, 'financial', 'quarterly_report.pdf'),
    question: 'What is the quarterly revenue?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Fund Factsheet',
    filePath: path.join(testPdfsDir, 'financial', 'fund_factsheet.pdf'),
    question: 'What is the fund\'s performance?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Portfolio Statement',
    filePath: path.join(testPdfsDir, 'financial', 'portfolio_statement.pdf'),
    question: 'What is the asset allocation?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  },
  {
    name: 'Trade Confirmation',
    filePath: path.join(testPdfsDir, 'financial', 'trade_confirmation.pdf'),
    question: 'What security was traded?',
    expectedResult: {
      uploadSuccess: true,
      processingSuccess: true,
      chatSuccess: true
    }
  }
];

module.exports = uploadTestCases;
