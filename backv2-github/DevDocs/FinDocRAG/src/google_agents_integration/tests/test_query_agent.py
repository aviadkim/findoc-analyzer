"""
Tests for the Query Agent.
"""
import os
import sys
import unittest

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the agent
from agents.query_agent import search_documents, answer_question

class TestQueryAgent(unittest.TestCase):
    """Test cases for the Query Agent."""
    
    def setUp(self):
        """Set up test environment."""
        # Create sample document data
        self.document_data = {
            "full_text": """
            Portfolio Statement
            
            Apple Inc. (US0378331005)
            Quantity: 100
            Price: 150.00 USD
            Value: 15000.00 USD
            
            Microsoft Corporation (US5949181045)
            Quantity: 50
            Price: 300.00 USD
            Value: 15000.00 USD
            
            Total Portfolio Value: 30000.00 USD
            
            Asset Allocation:
            Equities: 100%
            """,
            "tables": [
                {
                    "table_id": "table_1",
                    "page": 1,
                    "headers": ["Security", "ISIN", "Quantity", "Price", "Value"],
                    "data": [
                        {
                            "Security": "Apple Inc.",
                            "ISIN": "US0378331005",
                            "Quantity": "100",
                            "Price": "150.00",
                            "Value": "15000.00"
                        },
                        {
                            "Security": "Microsoft Corporation",
                            "ISIN": "US5949181045",
                            "Quantity": "50",
                            "Price": "300.00",
                            "Value": "15000.00"
                        }
                    ]
                }
            ],
            "financial_data": {
                "securities": [
                    {
                        "name": "Apple Inc.",
                        "identifier": "US0378331005",
                        "quantity": "100",
                        "value": "15000"
                    },
                    {
                        "name": "Microsoft Corporation",
                        "identifier": "US5949181045",
                        "quantity": "50",
                        "value": "15000"
                    }
                ],
                "total_value": 30000,
                "currency": "USD",
                "asset_allocation": {
                    "Equities": 100
                },
                "isins": ["US0378331005", "US5949181045"]
            }
        }
    
    def test_search_documents(self):
        """Test searching documents."""
        # Test various queries
        test_queries = [
            "What is the total portfolio value?",
            "How many Apple shares do I own?",
            "What is the ISIN for Microsoft?",
            "What is the asset allocation?",
            "How many securities are in the portfolio?"
        ]
        
        for query in test_queries:
            # Search documents
            results = search_documents(query, self.document_data)
            
            # Check if results were returned
            self.assertIsNotNone(results)
            self.assertIn("query", results)
            self.assertIn("matches", results)
            self.assertIn("tables", results)
            self.assertIn("financial_data", results)
            self.assertIn("answer", results)
            
            # Check query
            self.assertEqual(results["query"], query)
            
            # Check answer
            self.assertGreater(len(results["answer"]), 0)
    
    def test_answer_question(self):
        """Test answering questions."""
        # Test various questions
        test_questions = [
            "What is the total portfolio value?",
            "How many Apple shares do I own?",
            "What is the ISIN for Microsoft?",
            "What is the asset allocation?",
            "How many securities are in the portfolio?"
        ]
        
        for question in test_questions:
            # Answer question
            answer = answer_question(question, self.document_data)
            
            # Check if answer was returned
            self.assertIsNotNone(answer)
            self.assertGreater(len(answer), 0)
    
    def test_specific_questions(self):
        """Test specific questions with expected answers."""
        # Test specific questions with expected answers
        test_cases = [
            ("What is the total portfolio value?", "30000", "USD"),
            ("How many Apple shares do I own?", "100", "Apple"),
            ("What is the ISIN for Microsoft?", "US5949181045", "Microsoft"),
            ("What is the asset allocation?", "100%", "Equities"),
            ("How many securities are in the portfolio?", "2", "securities")
        ]
        
        for question, expected_text, expected_context in test_cases:
            # Answer question
            answer = answer_question(question, self.document_data)
            
            # Check if answer contains expected text
            self.assertIn(expected_text, answer, f"Failed for question: {question}")
            
            # Check if answer contains expected context
            self.assertIn(expected_context, answer, f"Failed for question: {question}")

if __name__ == "__main__":
    unittest.main()
