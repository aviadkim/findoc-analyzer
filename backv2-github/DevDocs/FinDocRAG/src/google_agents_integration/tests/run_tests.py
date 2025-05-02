#!/usr/bin/env python
"""
Run all tests for the Google Agent Technologies integration.
"""
import os
import sys
import unittest
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_tests():
    """Run all tests."""
    # Get the directory containing this script
    test_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Add the parent directory to the path
    sys.path.append(os.path.dirname(test_dir))
    
    # Discover and run tests
    logger.info("Discovering tests...")
    test_suite = unittest.defaultTestLoader.discover(test_dir, pattern="test_*.py")
    
    # Run tests
    logger.info("Running tests...")
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)
    
    # Return exit code
    return 0 if result.wasSuccessful() else 1

if __name__ == "__main__":
    sys.exit(run_tests())
