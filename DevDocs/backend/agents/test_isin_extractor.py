import unittest
import sys
import os
import json
import logging
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

# Import the agent
from agents.isin_extractor_agent import ISINExtractorAgent

class TestISINExtractorAgent(unittest.TestCase):
    def setUp(self):
        # Set up the agent with test configuration
        self.agent = ISINExtractorAgent()
        
        # Disable logging for tests
        logging.disable(logging.CRITICAL)
        
        # Create a temporary test directory if it doesn't exist
        self.test_dir = Path(__file__).parent / "test_data"
        if not self.test_dir.exists():
            os.makedirs(self.test_dir)
        
        # Create a sample financial text file for testing
        self.sample_file = self.test_dir / "sample_financial_text.txt"
        
        # Sample text with ISINs in various formats
        sample_text = """
        This is a financial document with several ISINs:
        ISIN: US0378331005 (Apple Inc.)
        ISIN Code: DE000BASF111 (BASF)
        Securities with ISIN US88160R1014 (Tesla)
        The security (ISIN: FR0000131104) represents BNP Paribas
        Some other codes: IE00B4L5Y983, GB00B03MLX29
        Some invalid ISINs: US123456789A, AB12345678901
        """
        
        with open(self.sample_file, 'w') as f:
            f.write(sample_text)
            
        # Expected extracted ISINs
        self.expected_isins = [
            "US0378331005", 
            "DE000BASF111", 
            "US88160R1014", 
            "FR0000131104", 
            "IE00B4L5Y983", 
            "GB00B03MLX29"
        ]
    
    def tearDown(self):
        # Clean up test files
        if self.sample_file.exists():
            os.remove(self.sample_file)
        
        # Remove test directory if empty
        if self.test_dir.exists() and len(os.listdir(self.test_dir)) == 0:
            os.rmdir(self.test_dir)
            
        # Re-enable logging
        logging.disable(logging.NOTSET)
    
    def test_extract_isins(self):
        """Test extracting ISINs from plain text"""
        with open(self.sample_file, 'r') as f:
            text = f.read()
        
        # Extract ISINs
        result = self.agent.extract_isins(text)
        
        # Check the results
        self.assertTrue(set(self.expected_isins).issubset(set(result)), 
                  f"Not all expected ISINs were found. Expected: {self.expected_isins}, Got: {result}")
    
    def test_isin_validation(self):
        """Test ISIN validation logic"""
        # Valid ISINs
        valid_isins = [
            "US0378331005",  # Apple
            "DE000BASF111",  # BASF
            "GB00B03MLX29",  # Unilever
            "FR0000131104",  # BNP Paribas
            "IE00B4L5Y983"   # iShares Core MSCI World
        ]
        
        # Invalid ISINs
        invalid_isins = [
            "US123456789A",  # Invalid checksum
            "AB12345678901", # Too long
            "US12345678",    # Too short
            "XX0000000000",  # Invalid country code
            "US000000000A"   # Non-numeric in digits part
        ]
        
        # Test valid ISINs
        for isin in valid_isins:
            self.assertTrue(
                self.agent.validate_isin(isin),
                f"ISIN {isin} should be valid"
            )
        
        # Test invalid ISINs
        for isin in invalid_isins:
            self.assertFalse(
                self.agent.validate_isin(isin),
                f"ISIN {isin} should be invalid"
            )
    
    def test_process(self):
        """Test processing a task with text input"""
        with open(self.sample_file, 'r') as f:
            text = f.read()
            
        # Create a task with the text
        task = {
            'text': text,
            'validate': True,
            'include_metadata': True
        }
        
        # Process the task
        result = self.agent.process(task)
        
        # Check if the result has the expected structure
        self.assertIn("status", result)
        self.assertEqual(result["status"], "success")
        self.assertIn("count", result)
        self.assertIn("isins", result)
        
        # Check that all expected ISINs are in the result
        found_isins = [item['isin'] for item in result["isins"]]
        for expected in self.expected_isins:
            self.assertIn(expected, found_isins, 
                     f"ISIN {expected} not found in processed results: {found_isins}")
            
    def test_find_isins_with_context(self):
        """Test finding ISINs with context"""
        with open(self.sample_file, 'r') as f:
            text = f.read()
            
        # Find ISINs with context
        results = self.agent.find_isins_with_context(text)
        
        # Check that each result has the expected structure
        for result in results:
            self.assertIn('isin', result)
            self.assertIn('position', result)
            self.assertIn('before_context', result)
            self.assertIn('after_context', result)
            self.assertIn('metadata', result)
            
        # Check that all expected ISINs were found
        found_isins = [result['isin'] for result in results]
        for expected in self.expected_isins:
            self.assertIn(expected, found_isins,
                     f"ISIN {expected} not found in results with context")

if __name__ == "__main__":
    unittest.main()
