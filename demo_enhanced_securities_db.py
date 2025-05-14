#!/usr/bin/env python3
"""
Demo script for the Enhanced Securities Reference Database.

This script demonstrates the key features of the enhanced securities database,
including:
1. Loading and initialization with config
2. Basic and advanced lookups
3. Fuzzy name matching
4. Security type detection
5. Data enrichment and validation
6. External data source connectivity
7. Updating and maintaining the database
"""

import os
import json
import argparse
import logging
from typing import Dict, List, Any, Optional
from enhanced_securities_reference_db import SecuritiesReferenceDB

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('securities_db_demo')

def setup_securities_db(config_path: Optional[str] = None) -> SecuritiesReferenceDB:
    """
    Set up the securities reference database.
    
    Args:
        config_path: Path to configuration file
        
    Returns:
        Initialized SecuritiesReferenceDB instance
    """
    # Use default config path if not provided
    if not config_path:
        config_path = os.path.join(os.path.dirname(__file__), 'securities_db_config.json')
    
    # Check if config file exists
    if not os.path.exists(config_path):
        logger.warning(f"Config file not found at {config_path}, using default settings")
        return SecuritiesReferenceDB()
    
    # Create the enhanced securities database
    logger.info(f"Initializing securities database with config from {config_path}")
    return SecuritiesReferenceDB(config_path)

def demonstrate_basic_lookups(db: SecuritiesReferenceDB) -> None:
    """
    Demonstrate basic lookup functionality.
    
    Args:
        db: SecuritiesReferenceDB instance
    """
    print("\n--- BASIC LOOKUPS ---")
    
    # Define test cases
    test_isins = [
        "US0378331005",  # Apple
        "US5949181045",  # Microsoft
        "US02079K3059",  # Alphabet (Google)
        "US0231351067",  # Amazon
        "DE0007664039"   # Volkswagen (may not be in default database)
    ]
    
    test_names = [
        "Apple Inc.",
        "Microsoft Corporation",
        "Alphabet Inc.",
        "Amazon.com Inc.",
        "Volkswagen AG"
    ]
    
    test_tickers = [
        "AAPL",
        "MSFT",
        "GOOGL",
        "AMZN",
        "VOW.DE"
    ]
    
    # Test ISIN to Name lookup
    print("\nLooking up names by ISIN:")
    for isin in test_isins:
        name = db.get_name_by_isin(isin)
        print(f"  ISIN: {isin} → Name: {name if name else 'Not found'}")
    
    # Test Name to ISIN lookup
    print("\nLooking up ISINs by Name:")
    for name in test_names:
        isin = db.get_isin_by_name(name)
        print(f"  Name: {name} → ISIN: {isin if isin else 'Not found'}")
    
    # Test Ticker to ISIN lookup
    print("\nLooking up ISINs by Ticker:")
    for ticker in test_tickers:
        isin = db.get_isin_by_ticker(ticker)
        print(f"  Ticker: {ticker} → ISIN: {isin if isin else 'Not found'}")

def demonstrate_fuzzy_matching(db: SecuritiesReferenceDB) -> None:
    """
    Demonstrate fuzzy name matching.
    
    Args:
        db: SecuritiesReferenceDB instance
    """
    print("\n--- FUZZY NAME MATCHING ---")
    
    # Define test cases with variations
    test_names = [
        "Apple",                 # Shortened
        "Microsoft Corp",        # Abbreviated
        "Alphabet (Google)",     # With additional info
        "Amazon.com",            # Partial
        "IBM",                   # Acronym
        "JP Morgan",             # Space removed
        "Bank of America",       # Partial
        "Procter & Gamble",      # Partial
        "Intl Business Machines" # Abbreviated and partial
    ]
    
    # Test fuzzy matching
    print("\nFuzzy matching company names:")
    for name in test_names:
        match = db.find_best_match_for_name(name)
        if match:
            print(f"  {name:<25} → {match['name']} (ISIN: {match['isin']}, Match Quality: {match.get('match_quality', 'unknown')})")
        else:
            print(f"  {name:<25} → No match found")

def demonstrate_security_info(db: SecuritiesReferenceDB) -> None:
    """
    Demonstrate comprehensive security information.
    
    Args:
        db: SecuritiesReferenceDB instance
    """
    print("\n--- COMPREHENSIVE SECURITY INFORMATION ---")
    
    # Define test ISINs for different security types
    test_isins = [
        "US0378331005",  # Apple (Equity)
        "US78462F1030",  # SPY (ETF)
        "US91282CJL17",  # US Treasury (Bond)
    ]
    
    # Get and display comprehensive information
    for isin in test_isins:
        info = db.get_security_info(isin)
        if info:
            print(f"\nInformation for ISIN: {isin}")
            for key, value in info.items():
                print(f"  {key}: {value}")
        else:
            print(f"\nNo information found for ISIN: {isin}")

def demonstrate_security_type_detection(db: SecuritiesReferenceDB) -> None:
    """
    Demonstrate security type detection.
    
    Args:
        db: SecuritiesReferenceDB instance
    """
    print("\n--- SECURITY TYPE DETECTION ---")
    
    # Define test descriptions
    test_descriptions = [
        "Apple Inc. Common Stock",
        "US Treasury 10-Year Note 2.5% 2026",
        "SPDR S&P 500 ETF Trust",
        "Vanguard Total Stock Market ETF",
        "JPMorgan 3% Corporate Bond 2028",
        "Gold Futures Contract Dec 2023",
        "Bitcoin Investment Trust",
        "Call Option AAPL 150 Dec 2023",
        "iShares Russell 2000 ETF",
        "Simon Property Group REIT"
    ]
    
    # Detect security types
    print("\nDetecting security types from descriptions:")
    for description in test_descriptions:
        security_type = db.detect_security_type(description)
        print(f"  {description:<40} → {security_type if security_type else 'Unknown'}")

def demonstrate_db_management(db: SecuritiesReferenceDB) -> None:
    """
    Demonstrate database management functions.
    
    Args:
        db: SecuritiesReferenceDB instance
    """
    print("\n--- DATABASE MANAGEMENT ---")
    
    # Count records
    count_isins = len(db.isin_to_name)
    count_tickers = len(db.ticker_to_name)
    
    print(f"\nCurrent database statistics:")
    print(f"  Total securities (ISINs): {count_isins}")
    print(f"  Total tickers: {count_tickers}")
    
    # Add a new security
    print("\nAdding a new security:")
    new_security = {
        "isin": "FR0000131104",
        "name": "BNP Paribas SA",
        "ticker": "BNP.PA",
        "exchange": "Euronext Paris",
        "sector": "Financial Services",
        "industry": "Banks - Diversified",
        "security_type": "equity",
        "country": "FR",
        "currency": "EUR"
    }
    
    success = db.add_security(new_security)
    print(f"  Addition {'successful' if success else 'failed'}")
    
    # Verify addition
    if success:
        name = db.get_name_by_isin("FR0000131104")
        isin = db.get_isin_by_name("BNP Paribas SA")
        
        print(f"  Verification:")
        print(f"    ISIN: FR0000131104 → Name: {name if name else 'Not found'}")
        print(f"    Name: BNP Paribas SA → ISIN: {isin if isin else 'Not found'}")
    
    # Remove the security
    print("\nRemoving the security:")
    success = db.remove_security("FR0000131104")
    print(f"  Removal {'successful' if success else 'failed'}")
    
    # Verify removal
    if success:
        name = db.get_name_by_isin("FR0000131104")
        isin = db.get_isin_by_name("BNP Paribas SA")
        
        print(f"  Verification:")
        print(f"    ISIN: FR0000131104 → Name: {name if name else 'Not found'}")
        print(f"    Name: BNP Paribas SA → ISIN: {isin if isin else 'Not found'}")
    
    # Save to and load from file
    print("\nSaving and loading database:")
    test_file = "test_securities_db.json"
    
    # Save
    save_success = db.save_to_file(test_file)
    print(f"  Save to {test_file} {'successful' if save_success else 'failed'}")
    
    # Load
    if save_success:
        new_db = SecuritiesReferenceDB()
        load_success = new_db.load_from_file(test_file)
        print(f"  Load from {test_file} {'successful' if load_success else 'failed'}")
        
        if load_success:
            # Verify loaded data
            count_loaded_isins = len(new_db.isin_to_name)
            print(f"  Loaded database has {count_loaded_isins} securities")
            
            # Check a specific security
            apple_name = new_db.get_name_by_isin("US0378331005")
            print(f"  Apple name in loaded database: {apple_name if apple_name else 'Not found'}")

def demonstrate_validation(db: SecuritiesReferenceDB) -> None:
    """
    Demonstrate validation functions.
    
    Args:
        db: SecuritiesReferenceDB instance
    """
    print("\n--- VALIDATION FUNCTIONS ---")
    
    # ISIN validation
    print("\nValidating ISINs:")
    test_isins = [
        "US0378331005",  # Valid (Apple)
        "US5949181045",  # Valid (Microsoft)
        "GB00B03MLX29",  # Valid (Royal Dutch Shell)
        "US123456789X",  # Invalid (wrong format)
        "US12345678901", # Invalid (too long)
        "US123456789"    # Invalid (too short)
    ]
    
    for isin in test_isins:
        is_valid = db.validate_isin(isin)
        print(f"  {isin:<12} → {'Valid' if is_valid else 'Invalid'}")
    
    # Normalization
    print("\nNormalizing security names:")
    test_names = [
        "apple inc.",
        "MICROSOFT CORPORATION",
        "Alphabet, Inc. Class A",
        "amazon.com, inc.",
        "J.P. Morgan Chase & Co."
    ]
    
    for name in test_names:
        normalized = db.normalize_security_name(name)
        print(f"  {name:<30} → {normalized}")

def main():
    """Main function for the demo script."""
    parser = argparse.ArgumentParser(description='Demo for Enhanced Securities Reference Database')
    parser.add_argument('--config', help='Path to configuration file')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    print("=== ENHANCED SECURITIES REFERENCE DATABASE DEMO ===")
    
    # Setup database
    db = setup_securities_db(args.config)
    
    # Run demonstrations
    demonstrate_basic_lookups(db)
    demonstrate_fuzzy_matching(db)
    demonstrate_security_info(db)
    demonstrate_security_type_detection(db)
    demonstrate_validation(db)
    demonstrate_db_management(db)
    
    print("\n=== DEMO COMPLETED ===")

if __name__ == "__main__":
    main()