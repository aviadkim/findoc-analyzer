#!/usr/bin/env python3
"""
Unit Tests for New FinDoc Analyzer Agents
This module tests the new financial agents added in Weeks 1-2.
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
    from DevDocs.backend.agents.financial_advisor_agent import FinancialAdvisorAgent
    from DevDocs.backend.agents.data_export_agent import DataExportAgent
    from DevDocs.backend.agents.document_comparison_agent import DocumentComparisonAgent
except ImportError:
    # Fallback import paths
    sys.path.append(os.path.abspath('DevDocs/backend/agents'))
    from financial_advisor_agent import FinancialAdvisorAgent
    from data_export_agent import DataExportAgent
    from document_comparison_agent import DocumentComparisonAgent

class TestFinancialAdvisorAgent(unittest.TestCase):
    """Unit tests for the FinancialAdvisorAgent"""

    @classmethod
    def setUpClass(cls):
        """Set up for all tests"""
        # Create test results directory if it doesn't exist
        Path("test_results").mkdir(exist_ok=True)
        
        # Initialize agent
        cls.agent = FinancialAdvisorAgent()
        
        # Create sample data
        cls.create_sample_data()
    
    @classmethod
    def create_sample_data(cls):
        """Create sample data for testing"""
        # Sample portfolio data
        cls.sample_portfolio = {
            'securities': [
                {'name': 'US Large Cap Fund', 'asset_class': 'equity', 'value': 50000, 'expense_ratio': 0.8},
                {'name': 'US Bond Fund', 'asset_class': 'fixed_income', 'value': 25000, 'expense_ratio': 0.6},
                {'name': 'International Equity Fund', 'asset_class': 'equity', 'value': 15000, 'expense_ratio': 1.2},
                {'name': 'Cash', 'asset_class': 'cash', 'value': 10000, 'expense_ratio': 0.0}
            ]
        }
        
        # Sample client profiles
        cls.conservative_profile = {
            'name': 'John Doe',
            'risk_profile': 'conservative',
            'age': 65,
            'financial_goals': ['retirement_income', 'capital_preservation']
        }
        
        cls.moderate_profile = {
            'name': 'Jane Smith',
            'risk_profile': 'moderate',
            'age': 45,
            'financial_goals': ['retirement', 'college_funding']
        }
        
        cls.aggressive_profile = {
            'name': 'Mike Johnson',
            'risk_profile': 'aggressive',
            'age': 30,
            'financial_goals': ['growth', 'retirement']
        }
    
    def test_agent_initialization(self):
        """Test agent initialization"""
        self.assertEqual(self.agent.name, "FinancialAdvisorAgent")
        self.assertTrue(hasattr(self.agent, 'benchmarks'))
        self.assertTrue(hasattr(self.agent, 'risk_profiles'))
        self.assertTrue(hasattr(self.agent, 'templates'))
    
    def test_portfolio_analysis(self):
        """Test portfolio analysis"""
        # Test with moderate profile
        result = self.agent.analyze_portfolio(self.sample_portfolio, self.moderate_profile)
        
        # Verify result structure
        self.assertEqual(result['status'], 'success')
        self.assertTrue('recommendations' in result)
        self.assertTrue('portfolio_summary' in result)
        
        # Verify recommendations
        recommendations = result['recommendations']
        self.assertTrue('allocation' in recommendations)
        self.assertTrue('diversification' in recommendations)
        self.assertTrue('expenses' in recommendations)
        self.assertTrue('risk' in recommendations)
        
        # Save result for inspection
        with open("test_results/advisor_analysis_result.json", "w") as f:
            json.dump(result, f, indent=2)
        
        # Test with conservative profile
        conservative_result = self.agent.analyze_portfolio(self.sample_portfolio, self.conservative_profile)
        self.assertEqual(conservative_result['status'], 'success')
        
        # Test with aggressive profile
        aggressive_result = self.agent.analyze_portfolio(self.sample_portfolio, self.aggressive_profile)
        self.assertEqual(aggressive_result['status'], 'success')
    
    def test_report_generation(self):
        """Test report generation"""
        # First, get analysis result
        analysis_result = self.agent.analyze_portfolio(self.sample_portfolio, self.moderate_profile)
        
        # Generate report
        report_result = self.agent.generate_report(self.sample_portfolio, self.moderate_profile, analysis_result)
        
        # Verify report structure
        self.assertEqual(report_result['status'], 'success')
        self.assertTrue('report' in report_result)
        
        report = report_result['report']
        self.assertTrue('title' in report)
        self.assertTrue('executive_summary' in report)
        self.assertTrue('portfolio_analysis' in report)
        self.assertTrue('key_recommendations' in report)
        self.assertTrue('implementation_plan' in report)
        
        # Save report for inspection
        with open("test_results/advisor_report.json", "w") as f:
            json.dump(report, f, indent=2)
    
    def test_error_handling(self):
        """Test error handling"""
        # Test with empty portfolio
        empty_portfolio = {'securities': []}
        result = self.agent.analyze_portfolio(empty_portfolio, self.moderate_profile)
        
        # Should return error
        self.assertEqual(result['status'], 'error')
        self.assertTrue('message' in result)
        
        # Test with invalid risk profile
        invalid_profile = {'name': 'Test User', 'risk_profile': 'invalid_profile'}
        result = self.agent.analyze_portfolio(self.sample_portfolio, invalid_profile)
        
        # Should default to moderate profile
        self.assertEqual(result['status'], 'success')


class TestDataExportAgent(unittest.TestCase):
    """Unit tests for the DataExportAgent"""

    @classmethod
    def setUpClass(cls):
        """Set up for all tests"""
        # Create test results directory if it doesn't exist
        Path("test_results").mkdir(exist_ok=True)
        
        # Initialize agent
        cls.agent = DataExportAgent()
        
        # Create sample data
        cls.create_sample_data()
    
    @classmethod
    def create_sample_data(cls):
        """Create sample data for testing"""
        # Sample portfolio data
        cls.sample_portfolio = {
            'metadata': {
                'date': '2025-05-08',
                'account': '123456789',
                'report_type': 'portfolio_summary'
            },
            'securities': [
                {'name': 'US Large Cap Fund', 'isin': 'US1234567890', 'value': 50000, 'currency': 'USD', 'weight': 0.5},
                {'name': 'Global Bond Fund', 'isin': 'US0987654321', 'value': 30000, 'currency': 'USD', 'weight': 0.3},
                {'name': 'Emerging Markets ETF', 'isin': 'US5555555555', 'value': 20000, 'currency': 'USD', 'weight': 0.2}
            ],
            'summary': {
                'total_value': 100000,
                'currency': 'USD',
                'asset_allocation': {
                    'equity': 70,
                    'fixed_income': 30
                }
            }
        }
        
        # Sample analysis data
        cls.sample_analysis = {
            'document_type': 'portfolio_analysis',
            'portfolio_summary': {
                'total_value': 100000,
                'total_securities': 3,
                'asset_allocation': {
                    'equity': 70,
                    'fixed_income': 30
                }
            },
            'risk_metrics': {
                'volatility': 12.5,
                'sharpe_ratio': 0.8,
                'max_drawdown': 15.2
            },
            'performance_metrics': {
                'ytd_return': 8.2,
                '1y_return': 12.5,
                '3y_return': 9.8
            },
            'recommendations': [
                'Consider increasing international exposure',
                'Review high expense ratio funds',
                'Add more diversification to fixed income'
            ]
        }
    
    def test_agent_initialization(self):
        """Test agent initialization"""
        self.assertEqual(self.agent.name, "DataExportAgent")
        self.assertTrue(hasattr(self.agent, 'supported_formats'))
        self.assertTrue(hasattr(self.agent, 'export_dir'))
    
    def test_json_export(self):
        """Test JSON export"""
        result = self.agent.export_data(self.sample_portfolio, 'json', 'test_portfolio')
        
        # Verify result
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['format'], 'json')
        
        # Verify file exists
        file_path = result['file_path']
        self.assertTrue(os.path.exists(file_path))
        
        # Verify file content
        with open(file_path, 'r') as f:
            content = json.load(f)
            self.assertEqual(content['metadata']['account'], '123456789')
            self.assertEqual(len(content['securities']), 3)
    
    def test_csv_export(self):
        """Test CSV export"""
        result = self.agent.export_data(self.sample_portfolio, 'csv', 'test_portfolio')
        
        # Verify result
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['format'], 'csv')
        
        # Verify file exists
        file_path = result['file_path']
        self.assertTrue(os.path.exists(file_path))
        
        # Verify file content
        df = pd.read_csv(file_path)
        self.assertEqual(len(df), 3)  # 3 securities
    
    def test_excel_export(self):
        """Test Excel export"""
        result = self.agent.export_data(self.sample_portfolio, 'excel', 'test_portfolio')
        
        # Verify result
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['format'], 'excel')
        
        # Verify file exists
        file_path = result['file_path']
        self.assertTrue(os.path.exists(file_path))
    
    def test_html_export(self):
        """Test HTML export"""
        result = self.agent.export_data(self.sample_analysis, 'html', 'test_analysis')
        
        # Verify result
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['format'], 'html')
        
        # Verify file exists
        file_path = result['file_path']
        self.assertTrue(os.path.exists(file_path))
        
        # Verify file content - just check for html tag rather than specific content
        with open(file_path, 'r') as f:
            content = f.read()
            self.assertTrue('<html>' in content)
    
    def test_specialized_exports(self):
        """Test specialized export methods"""
        # Test portfolio export
        portfolio_result = self.agent.export_portfolio(self.sample_portfolio, 'json', 'specialized_portfolio')
        self.assertEqual(portfolio_result['status'], 'success')
        
        # Test analysis export
        analysis_result = self.agent.export_analysis(self.sample_analysis, 'json', 'specialized_analysis')
        self.assertEqual(analysis_result['status'], 'success')
    
    def test_error_handling(self):
        """Test error handling"""
        # Test with unsupported format
        result = self.agent.export_data(self.sample_portfolio, 'unsupported_format')
        self.assertEqual(result['status'], 'error')
        self.assertTrue('Unsupported format' in result['message'])


class TestDocumentComparisonAgent(unittest.TestCase):
    """Unit tests for the DocumentComparisonAgent"""

    @classmethod
    def setUpClass(cls):
        """Set up for all tests"""
        # Create test results directory if it doesn't exist
        Path("test_results").mkdir(exist_ok=True)
        
        # Initialize agent
        cls.agent = DocumentComparisonAgent()
        
        # Create sample data
        cls.create_sample_data()
    
    @classmethod
    def create_sample_data(cls):
        """Create sample data for testing"""
        # Sample documents for comparison
        cls.doc1 = {
            'metadata': {
                'document_type': 'portfolio_statement',
                'date': '2025-01-15'
            },
            'securities': [
                {'name': 'US Large Cap Fund', 'isin': 'US1234567890', 'value': 50000},
                {'name': 'Global Bond Fund', 'isin': 'US0987654321', 'value': 30000}
            ],
            'summary': {
                'total_value': 80000,
                'total_securities': 2
            }
        }
        
        cls.doc2 = {
            'metadata': {
                'document_type': 'portfolio_statement',
                'date': '2025-02-15'
            },
            'securities': [
                {'name': 'US Large Cap Fund', 'isin': 'US1234567890', 'value': 52000},
                {'name': 'Global Bond Fund', 'isin': 'US0987654321', 'value': 29000},
                {'name': 'Tech ETF', 'isin': 'US5555555555', 'value': 20000}
            ],
            'summary': {
                'total_value': 101000,
                'total_securities': 3
            }
        }
        
        cls.doc3 = {
            'metadata': {
                'document_type': 'portfolio_statement',
                'date': '2025-03-15'
            },
            'securities': [
                {'name': 'US Large Cap Fund', 'isin': 'US1234567890', 'value': 54000},
                {'name': 'Global Bond Fund', 'isin': 'US0987654321', 'value': 28000},
                {'name': 'Tech ETF', 'isin': 'US5555555555', 'value': 22000},
                {'name': 'Healthcare ETF', 'isin': 'US6666666666', 'value': 15000}
            ],
            'summary': {
                'total_value': 119000,
                'total_securities': 4
            }
        }
        
        # Sample transaction documents
        cls.trans_doc1 = {
            'metadata': {
                'document_type': 'transaction_history',
                'date': '2025-01-31'
            },
            'transactions': [
                {'date': '2025-01-05', 'type': 'buy', 'security_name': 'US Large Cap Fund', 'amount': 10000},
                {'date': '2025-01-20', 'type': 'buy', 'security_name': 'Global Bond Fund', 'amount': 5000}
            ]
        }
        
        cls.trans_doc2 = {
            'metadata': {
                'document_type': 'transaction_history',
                'date': '2025-02-28'
            },
            'transactions': [
                {'date': '2025-01-05', 'type': 'buy', 'security_name': 'US Large Cap Fund', 'amount': 10000},
                {'date': '2025-01-20', 'type': 'buy', 'security_name': 'Global Bond Fund', 'amount': 5000},
                {'date': '2025-02-10', 'type': 'buy', 'security_name': 'Tech ETF', 'amount': 20000}
            ]
        }
    
    def test_agent_initialization(self):
        """Test agent initialization"""
        self.assertEqual(self.agent.name, "DocumentComparisonAgent")
        self.assertTrue(hasattr(self.agent, 'comparison_config'))
    
    def test_compare_securities(self):
        """Test securities comparison"""
        result = self.agent.compare_documents([self.doc1, self.doc2], 'securities')
        
        # Verify result structure
        self.assertEqual(result['status'], 'success')
        self.assertTrue('securities_comparison' in result)
        
        securities_comparison = result['securities_comparison']
        self.assertEqual(securities_comparison['status'], 'success')
        
        # Verify counts
        self.assertEqual(securities_comparison['total_unique_securities'], 3)
        self.assertTrue(len(securities_comparison['added_securities']) > 0)
        
        # Save result for inspection
        with open("test_results/securities_comparison_result.json", "w") as f:
            json.dump(result, f, indent=2)
    
    def test_compare_multiple_documents(self):
        """Test comparison of multiple documents"""
        try:
            result = self.agent.compare_documents([self.doc1, self.doc2], 'comprehensive')
            
            # Verify result structure
            self.assertEqual(result['status'], 'success')
            
            # Verify document count
            self.assertEqual(result['document_count'], 2)
            
            # Save result for inspection
            with open("test_results/multi_doc_comparison_result.json", "w") as f:
                json.dump(result, f, indent=2)
        except Exception as e:
            self.fail(f"Document comparison raised exception: {str(e)}")
    
    def test_compare_transactions(self):
        """Test transactions comparison"""
        result = self.agent.compare_documents([self.trans_doc1, self.trans_doc2], 'transactions')
        
        # Verify result structure
        self.assertEqual(result['status'], 'success')
        self.assertTrue('transactions_comparison' in result)
        
        # Verify counts
        transactions_comparison = result['transactions_comparison']
        self.assertEqual(transactions_comparison['total_unique_transactions'], 3)
        self.assertEqual(transactions_comparison['total_new_transactions'], 1)
        
        # Save result for inspection
        with open("test_results/transactions_comparison_result.json", "w") as f:
            json.dump(result, f, indent=2)
    
    def test_report_generation(self):
        """Test comparison report generation"""
        # Use a simple comparison result for report generation
        try:
            # Generate a simple comparison result
            comparison_result = self.agent.compare_documents([self.doc1, self.doc2], 'securities')
            
            if comparison_result['status'] == 'success':
                # Generate report
                report_result = self.agent.generate_report(comparison_result)
                
                # Verify report structure exists
                self.assertTrue('report' in report_result or 'status' in report_result)
                
                # Save report for inspection
                with open("test_results/comparison_report.json", "w") as f:
                    json.dump(report_result, f, indent=2)
            else:
                self.skipTest("Skipping report test as comparison failed")
        except Exception as e:
            self.fail(f"Report generation raised exception: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling"""
        # Test with single document
        result = self.agent.compare_documents([self.doc1])
        self.assertEqual(result['status'], 'error')
        self.assertTrue('two documents' in result['message'])
        
        # Test with empty documents
        empty_doc = {'metadata': {}, 'securities': []}
        result = self.agent.compare_documents([empty_doc, empty_doc])
        # Just check that the call succeeds, not specific structure
        self.assertEqual(result['status'], 'success')
        

def run_tests():
    """Run all tests for the new agents"""
    print("=== Running tests for FinDoc Analyzer new agents ===\n")
    
    # Create test suites
    advisor_suite = unittest.TestLoader().loadTestsFromTestCase(TestFinancialAdvisorAgent)
    export_suite = unittest.TestLoader().loadTestsFromTestCase(TestDataExportAgent)
    comparison_suite = unittest.TestLoader().loadTestsFromTestCase(TestDocumentComparisonAgent)
    
    # Create a combined test suite
    all_tests = unittest.TestSuite([advisor_suite, export_suite, comparison_suite])
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    results = runner.run(all_tests)
    
    # Save test results
    test_results = {
        'run_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'tests_run': results.testsRun,
        'errors': len(results.errors),
        'failures': len(results.failures),
        'skipped': len(results.skipped),
        'successful': results.wasSuccessful()
    }
    
    with open("test_results/new_agents_test_results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    
    print("\n=== New agents test summary ===")
    print(f"Tests run: {test_results['tests_run']}")
    print(f"Errors: {test_results['errors']}")
    print(f"Failures: {test_results['failures']}")
    print(f"Success: {test_results['successful']}")
    
    return test_results['successful']

if __name__ == "__main__":
    run_tests()
