"""
Tests for the Financial Analyst Agent.
"""
import os
import sys
import unittest

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the agent
from agents.financial_analyst_agent import analyze_portfolio, evaluate_security, determine_asset_class, calculate_diversification_score

class TestFinancialAnalystAgent(unittest.TestCase):
    """Test cases for the Financial Analyst Agent."""
    
    def test_analyze_portfolio(self):
        """Test analyzing a portfolio."""
        # Create financial data
        financial_data = {
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
                },
                {
                    "name": "US Treasury Bond 2.5% 2030",
                    "identifier": "US912810TL45",
                    "quantity": "10000",
                    "value": "10000"
                }
            ],
            "total_value": 40000,
            "currency": "USD",
            "asset_allocation": {
                "Equities": 75,
                "Bonds": 25
            }
        }
        
        # Analyze portfolio
        portfolio_analysis = analyze_portfolio(financial_data)
        
        # Check if portfolio analysis was created
        self.assertIn("security_count", portfolio_analysis)
        self.assertIn("total_value", portfolio_analysis)
        self.assertIn("currency", portfolio_analysis)
        self.assertIn("securities_value", portfolio_analysis)
        self.assertIn("value_match", portfolio_analysis)
        self.assertIn("asset_allocation", portfolio_analysis)
        self.assertIn("diversification_score", portfolio_analysis)
        self.assertIn("risk_profile", portfolio_analysis)
        self.assertIn("recommendations", portfolio_analysis)
        
        # Check security count
        self.assertEqual(portfolio_analysis["security_count"], 3)
        
        # Check total value
        self.assertEqual(portfolio_analysis["total_value"], 40000)
        
        # Check currency
        self.assertEqual(portfolio_analysis["currency"], "USD")
        
        # Check securities value
        self.assertEqual(portfolio_analysis["securities_value"], 40000)
        
        # Check value match
        self.assertTrue(portfolio_analysis["value_match"])
        
        # Check asset allocation
        self.assertEqual(portfolio_analysis["asset_allocation"]["Equities"], 75)
        self.assertEqual(portfolio_analysis["asset_allocation"]["Bonds"], 25)
        
        # Check diversification score
        self.assertGreater(portfolio_analysis["diversification_score"], 0)
        
        # Check risk profile
        self.assertIn(portfolio_analysis["risk_profile"], ["Conservative", "Moderate", "Balanced", "Growth", "Aggressive"])
        
        # Check recommendations
        self.assertIsInstance(portfolio_analysis["recommendations"], list)
    
    def test_evaluate_security(self):
        """Test evaluating a security."""
        # Create security data
        security = {
            "name": "Apple Inc.",
            "identifier": "US0378331005",
            "quantity": "100",
            "value": "15000"
        }
        
        # Evaluate security
        security_evaluation = evaluate_security(security)
        
        # Check if security evaluation was created
        self.assertIn("name", security_evaluation)
        self.assertIn("identifier", security_evaluation)
        self.assertIn("security_type", security_evaluation)
        self.assertIn("quantity", security_evaluation)
        self.assertIn("value", security_evaluation)
        self.assertIn("price", security_evaluation)
        self.assertIn("asset_class", security_evaluation)
        self.assertIn("risk_level", security_evaluation)
        self.assertIn("recommendations", security_evaluation)
        
        # Check name
        self.assertEqual(security_evaluation["name"], "Apple Inc.")
        
        # Check identifier
        self.assertEqual(security_evaluation["identifier"], "US0378331005")
        
        # Check security type
        self.assertIn(security_evaluation["security_type"], ["Stock", "US Security"])
        
        # Check quantity
        self.assertEqual(security_evaluation["quantity"], "100")
        
        # Check value
        self.assertEqual(security_evaluation["value"], "15000")
        
        # Check price
        self.assertEqual(security_evaluation["price"], 150.0)
        
        # Check asset class
        self.assertEqual(security_evaluation["asset_class"], "Equities")
        
        # Check risk level
        self.assertIn(security_evaluation["risk_level"], ["Low", "Medium", "High"])
        
        # Check recommendations
        self.assertIsInstance(security_evaluation["recommendations"], list)
    
    def test_determine_asset_class(self):
        """Test determining asset class from security name."""
        # Test various security names
        test_cases = [
            ("Apple Inc.", "Equities"),
            ("Microsoft Corporation", "Equities"),
            ("US Treasury Bond 2.5% 2030", "Bonds"),
            ("iShares S&P 500 ETF", "Equity ETFs"),
            ("Vanguard Total Bond Market ETF", "Bond ETFs"),
            ("Cash", "Cash"),
            ("Gold", "Commodities"),
            ("Vanguard REIT ETF", "Real Estate"),
            ("S&P 500 Index Future", "Derivatives")
        ]
        
        for security_name, expected_asset_class in test_cases:
            asset_class = determine_asset_class(security_name)
            self.assertEqual(asset_class, expected_asset_class, f"Failed for {security_name}")
    
    def test_calculate_diversification_score(self):
        """Test calculating diversification score."""
        # Test various asset allocations
        test_cases = [
            # Single asset class (no diversification)
            ({"Equities": 100}, 0),
            # Two asset classes (some diversification)
            ({"Equities": 50, "Bonds": 50}, 100),
            # Multiple asset classes (good diversification)
            ({"Equities": 40, "Bonds": 30, "Real Estate": 20, "Commodities": 10}, 75),
            # Empty asset allocation
            ({}, 0)
        ]
        
        for asset_allocation, expected_score in test_cases:
            score = calculate_diversification_score(asset_allocation)
            # Allow for some floating point differences
            self.assertAlmostEqual(score, expected_score, delta=5, msg=f"Failed for {asset_allocation}")

if __name__ == "__main__":
    unittest.main()
