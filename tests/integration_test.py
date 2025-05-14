#!/usr/bin/env python3
"""
Integration Tests for FinDoc Analyzer Agents
This module tests the integration between different financial agents in the system.
"""

import os
import sys
import json
import unittest
from datetime import datetime
import pandas as pd
import numpy as np
from pathlib import Path

# Add parent directory to path to import agents
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import agents (adjust paths as needed based on actual project structure)
try:
    from DevDocs.backend.agents.isin_extractor_agent import ISINExtractorAgent
    from DevDocs.backend.agents.financial_table_detector_agent import FinancialTableDetectorAgent
    from DevDocs.backend.agents.financial_data_analyzer_agent import FinancialDataAnalyzerAgent
    from DevDocs.backend.agents.document_merge_agent import DocumentMergeAgent
except ImportError:
    # Fallback import paths
    sys.path.append(os.path.abspath('DevDocs/backend/agents'))
    from isin_extractor_agent import ISINExtractorAgent
    from financial_table_detector_agent import FinancialTableDetectorAgent
    from financial_data_analyzer_agent import FinancialDataAnalyzerAgent
    from document_merge_agent import DocumentMergeAgent

class TestAgentIntegration(unittest.TestCase):
    """Integration tests for the FinDoc Analyzer Agents"""

    @classmethod
    def setUpClass(cls):
        """Set up for all tests"""
        # Create test results directory if it doesn't exist
        Path("test_results").mkdir(exist_ok=True)
        
        # Initialize agents
        cls.isin_agent = ISINExtractorAgent()
        cls.table_agent = FinancialTableDetectorAgent()
        cls.data_agent = FinancialDataAnalyzerAgent()
        cls.merge_agent = DocumentMergeAgent()
        
        # Generate sample data for testing
        cls.generate_test_data()
    
    @classmethod
    def generate_test_data(cls):
        """Generate sample financial data for testing"""
        # Sample document text with ISINs
        cls.sample_text = """
        Portfolio Statement
        
        Security Name: Acme Global Fund
        ISIN: US0378331005
        Value: 10,000 USD
        
        Security Name: European Growth Fund
        ISIN: EU0123456789
        Value: 15,000 EUR
        
        Security Name: Emerging Markets Bond
        ISIN: GB9876543210
        Value: 8,000 GBP
        """
        
        # Sample portfolio data
        cls.portfolio_data = pd.DataFrame({
            'security_name': ['Acme Global Fund', 'European Growth Fund', 'Emerging Markets Bond'],
            'isin': ['US0378331005', 'EU0123456789', 'GB9876543210'],
            'value': [10000, 15000, 8000],
            'currency': ['USD', 'EUR', 'GBP'],
            'asset_class': ['Equity', 'Equity', 'Fixed Income'],
            'country': ['US', 'EU', 'GB'],
            'weight': [0.30, 0.45, 0.25]
        })
        
        # Sample documents for merging
        cls.doc1 = {
            'metadata': {
                'document_type': 'portfolio_statement',
                'date': '2025-01-15',
                'account_number': '123456789'
            },
            'securities': [
                {'name': 'Acme Global Fund', 'isin': 'US0378331005', 'value': 10000, 'currency': 'USD'},
                {'name': 'Tech Growth Fund', 'isin': 'US8765432109', 'value': 5000, 'currency': 'USD'}
            ],
            'summary': {
                'total_value': 15000,
                'currency': 'USD'
            }
        }
        
        cls.doc2 = {
            'metadata': {
                'document_type': 'portfolio_statement',
                'date': '2025-02-15',
                'account_number': '123456789'
            },
            'securities': [
                {'name': 'Acme Global Fund', 'isin': 'US0378331005', 'value': 11000, 'currency': 'USD'},
                {'name': 'Tech Growth Fund', 'isin': 'US8765432109', 'value': 4500, 'currency': 'USD'},
                {'name': 'Healthcare Fund', 'isin': 'US5555555555', 'value': 6000, 'currency': 'USD'}
            ],
            'summary': {
                'total_value': 21500,
                'currency': 'USD'
            }
        }
    
    def test_isin_to_table_integration(self):
        """Test integration between ISIN extraction and table detection"""
        print("Testing ISIN extraction to table detection integration...")
        
        # Extract ISINs from text
        isin_results = self.isin_agent.extract_isins(self.sample_text)
        
        # Verify ISINs were extracted
        self.assertTrue(len(isin_results.get('isins', [])) > 0, "ISINs should be extracted")
        
        # Convert ISIN results to a table format
        securities_data = []
        for isin_info in isin_results.get('isins', []):
            security = {
                'isin': isin_info.get('isin'),
                'security_name': isin_info.get('security_name', ''),
                'currency': isin_info.get('currency', ''),
                'country_code': isin_info.get('country_code', '')
            }
            securities_data.append(security)
        
        # Create a DataFrame for the table agent
        securities_df = pd.DataFrame(securities_data)
        
        # Save the table to test_results
        securities_df.to_csv("test_results/extracted_securities.csv", index=False)
        
        # Verify data was properly transformed
        self.assertEqual(len(securities_df), len(isin_results.get('isins', [])), 
                         "Table should have the same number of rows as extracted ISINs")
        
        print("Success: ISIN to table integration test passed.")
        
        return securities_df
    
    def test_table_to_analyzer_integration(self):
        """Test integration between table detection and financial data analyzer"""
        print("Testing table detection to financial data analyzer integration...")
        
        # Use the actual portfolio data
        df = self.portfolio_data
        
        # Analyze the portfolio data
        analysis_results = self.data_agent.analyze_portfolio_table(df, "portfolio_analysis")
        
        # Verify analysis was performed
        self.assertEqual(analysis_results.get('status'), 'success', "Analysis should be successful")
        self.assertTrue('analysis' in analysis_results, "Analysis results should be present")
        
        # Save analysis results to JSON
        with open("test_results/integration_analysis_result.json", "w") as f:
            json.dump(analysis_results, f, indent=2)
        
        print("Success: Table to analyzer integration test passed.")
        
        return analysis_results
    
    def test_full_pipeline_integration(self):
        """Test the full pipeline integration from ISIN extraction to document merging"""
        print("Testing full pipeline integration...")
        
        # 1. Extract ISINs
        isin_results = self.isin_agent.extract_isins(self.sample_text)
        
        # 2. Convert to table format
        securities_data = []
        for isin_info in isin_results.get('isins', []):
            security = {
                'isin': isin_info.get('isin'),
                'security_name': isin_info.get('security_name', ''),
                'currency': isin_info.get('currency', ''),
                'value': isin_info.get('value', 0),
                'country_code': isin_info.get('country_code', '')
            }
            securities_data.append(security)
        
        securities_df = pd.DataFrame(securities_data)
        
        # 3. Analyze financial data
        analysis_results = self.data_agent.analyze_portfolio_table(securities_df, "portfolio_analysis")
        
        # 4. Create document with analysis results
        doc3 = {
            'metadata': {
                'document_type': 'analysis_result',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'source': 'integration_test'
            },
            'securities': securities_data,
            'analysis': analysis_results.get('analysis', {})
        }
        
        # 5. Merge with existing documents
        merged_result = self.merge_agent.merge_documents([self.doc1, self.doc2, doc3], "comprehensive")
        
        # Verify the merged document contains data from all sources
        self.assertTrue('securities' in merged_result, "Merged document should contain securities")
        self.assertTrue('analysis' in merged_result, "Merged document should contain analysis")
        
        # Save the merged result
        with open("test_results/full_pipeline_result.json", "w") as f:
            json.dump(merged_result, f, indent=2)
        
        print("Success: Full pipeline integration test passed.")
        
        return merged_result
    
    def test_error_handling_integration(self):
        """Test error handling across integrated agents"""
        print("Testing error handling in integrated agents...")
        
        # Test with invalid data
        invalid_df = pd.DataFrame({
            'invalid_column': ['This', 'is', 'invalid', 'data']
        })
        
        # The analyzer should handle invalid data gracefully
        analysis_results = self.data_agent.analyze_portfolio_table(invalid_df, "portfolio_analysis")
        
        # Check if the analyzer returns an error or handles it gracefully
        self.assertTrue('status' in analysis_results, "Analyzer should return a status even with invalid data")
        
        # Try to merge an empty document list
        empty_merge_result = self.merge_agent.merge_documents([], "simple")
        
        # Should return an empty dict, not crash
        self.assertEqual(empty_merge_result, {}, "Merging empty document list should return empty dict")
        
        print("Success: Error handling integration test passed.")

def run_tests():
    """Run the integration tests"""
    print("=== Running integration tests for FinDoc Analyzer agents ===\n")
    
    # Create a test suite and run the tests
    suite = unittest.TestLoader().loadTestsFromTestCase(TestAgentIntegration)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Save test results
    test_results = {
        'run_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'tests_run': result.testsRun,
        'errors': len(result.errors),
        'failures': len(result.failures),
        'skipped': len(result.skipped),
        'successful': result.wasSuccessful()
    }
    
    with open("test_results/integration_test_results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    
    print("\n=== Integration test summary ===")
    print(f"Tests run: {test_results['tests_run']}")
    print(f"Errors: {test_results['errors']}")
    print(f"Failures: {test_results['failures']}")
    print(f"Success: {test_results['successful']}")
    
    return test_results['successful']

if __name__ == "__main__":
    run_tests()
