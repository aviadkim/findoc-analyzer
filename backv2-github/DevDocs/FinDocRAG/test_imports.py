"""
Simple script to test imports.
"""

import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Print current directory and Python path
logger.info(f"Current directory: {os.getcwd()}")
logger.info(f"Python path: {sys.path}")

# Add the src directory to the path
src_path = os.path.join(os.path.dirname(__file__), 'src')
logger.info(f"Adding to path: {src_path}")
sys.path.append(src_path)

# Print Python path after modification
logger.info(f"Python path after modification: {sys.path}")

# Check if the extractors directory exists
extractors_path = os.path.join(src_path, 'extractors')
logger.info(f"Checking if extractors path exists: {extractors_path}")
if os.path.exists(extractors_path):
    logger.info(f"Extractors path exists: {extractors_path}")
    logger.info(f"Contents of {extractors_path}:")
    for file in os.listdir(extractors_path):
        logger.info(f"  {file}")
else:
    logger.error(f"Extractors path does not exist: {extractors_path}")

# Try to import the modules
try:
    logger.info("Trying to import from extractors package...")
    from extractors.grid_analyzer import GridAnalyzer
    from extractors.enhanced_securities_extractor import SecurityExtractor
    logger.info("Successfully imported from extractors package")
except ImportError as e:
    logger.error(f"Import failed: {str(e)}")
    try:
        logger.info("Trying to import with direct path...")
        sys.path.insert(0, extractors_path)
        from grid_analyzer import GridAnalyzer
        from enhanced_securities_extractor import SecurityExtractor
        logger.info("Successfully imported with direct path")
    except ImportError as e2:
        logger.error(f"Direct path import failed: {str(e2)}")

# Print success if we got here
logger.info("Script completed")

if __name__ == "__main__":
    logger.info("Running as main script")
