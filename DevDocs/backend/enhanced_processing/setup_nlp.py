"""
Setup script for NLP models.

This script downloads the required NLTK and spaCy models for the Financial Document Processor.
Run this script once before using the Financial Document Processor with NLP features.
"""

import os
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def setup_nltk():
    """
    Download required NLTK models.
    """
    try:
        import nltk
        
        # Create NLTK data directory if it doesn't exist
        nltk_data_dir = os.path.join(os.path.expanduser("~"), "nltk_data")
        os.makedirs(nltk_data_dir, exist_ok=True)
        
        # Download required NLTK models
        logger.info("Downloading NLTK models...")
        nltk.download('punkt')
        nltk.download('averaged_perceptron_tagger')
        nltk.download('maxent_ne_chunker')
        nltk.download('words')
        
        logger.info("NLTK models downloaded successfully")
        return True
    
    except ImportError:
        logger.error("NLTK not installed. Please install it with 'pip install nltk'")
        return False
    
    except Exception as e:
        logger.error(f"Error downloading NLTK models: {e}")
        return False

def setup_spacy():
    """
    Download required spaCy models.
    """
    try:
        import spacy
        from spacy.cli import download
        
        # Download spaCy model
        logger.info("Downloading spaCy model...")
        download("en_core_web_sm")
        
        # Test if model works
        nlp = spacy.load("en_core_web_sm")
        doc = nlp("This is a test sentence with Apple Inc. and $100.")
        
        # Check if entities are detected
        entities = [(ent.text, ent.label_) for ent in doc.ents]
        logger.info(f"spaCy test entities: {entities}")
        
        logger.info("spaCy model downloaded and tested successfully")
        return True
    
    except ImportError:
        logger.error("spaCy not installed. Please install it with 'pip install spacy'")
        return False
    
    except Exception as e:
        logger.error(f"Error downloading spaCy model: {e}")
        return False

def main():
    """
    Main function.
    """
    logger.info("Setting up NLP models for Financial Document Processor")
    
    # Setup NLTK
    nltk_success = setup_nltk()
    
    # Setup spaCy
    spacy_success = setup_spacy()
    
    # Print summary
    if nltk_success and spacy_success:
        logger.info("All NLP models set up successfully")
    elif nltk_success:
        logger.warning("NLTK models set up successfully, but spaCy setup failed")
    elif spacy_success:
        logger.warning("spaCy model set up successfully, but NLTK setup failed")
    else:
        logger.error("Failed to set up NLP models")

if __name__ == "__main__":
    main()
