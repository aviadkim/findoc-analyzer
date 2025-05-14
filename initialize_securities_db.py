#!/usr/bin/env python3
"""
Initialize the enhanced securities reference database.

This script initializes the enhanced securities reference database by
creating the initial database file and populating it with the built-in
securities data from the enhanced_securities_reference_db module.
"""

import os
import sys
import json
import argparse
import logging
from pathlib import Path
from enhanced_securities_reference_db import SecuritiesReferenceDB

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('initialize_securities_db')

def initialize_db(config_path, output_path=None, add_sample_data=True):
    """
    Initialize the enhanced securities reference database.
    
    Args:
        config_path: Path to the configuration file
        output_path: Path to save the database, defaults to config setting
        add_sample_data: Whether to add sample data beyond built-in data
        
    Returns:
        True if successful, False otherwise
    """
    logger.info(f"Initializing database with config: {config_path}")
    
    # Check if config file exists
    if not os.path.exists(config_path):
        logger.error(f"Config file not found: {config_path}")
        return False
    
    try:
        # Load configuration
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # Initialize the database
        db = SecuritiesReferenceDB(config_path)
        
        # Determine output path
        if not output_path:
            if 'database_paths' in config and 'primary' in config['database_paths']:
                output_path = config['database_paths']['primary']
            else:
                output_path = os.path.join(os.path.dirname(config_path), 'data/securities_reference_db.json')
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Add sample data if requested
        if add_sample_data:
            logger.info("Adding sample securities data")
            _add_sample_data(db)
        
        # Save the database
        logger.info(f"Saving database to: {output_path}")
        success = db.save_to_file(output_path)
        
        if success:
            logger.info(f"Database initialized successfully: {len(db.isin_to_name)} securities")
            
            # Also save a backup if configured
            if 'database_paths' in config and 'backup' in config['database_paths']:
                backup_path = config['database_paths']['backup']
                if backup_path:
                    logger.info(f"Creating backup at: {backup_path}")
                    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
                    db.save_to_file(backup_path)
            
            return True
        else:
            logger.error("Failed to save database")
            return False
            
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        return False

def _add_sample_data(db):
    """
    Add sample securities data to the database.
    
    Args:
        db: SecuritiesReferenceDB instance
    """
    # Add some international equities
    international_equities = [
        {
            "isin": "CH0038863350",
            "name": "Nestle SA",
            "ticker": "NESN.SW",
            "exchange": "SIX",
            "sector": "Consumer Defensive",
            "industry": "Packaged Foods",
            "security_type": "equity",
            "country": "CH",
            "currency": "CHF"
        },
        {
            "isin": "JP3633400001",
            "name": "Toyota Motor Corp",
            "ticker": "7203.T",
            "exchange": "TSE",
            "sector": "Consumer Cyclical",
            "industry": "Auto Manufacturers",
            "security_type": "equity",
            "country": "JP",
            "currency": "JPY"
        },
        {
            "isin": "FR0000131104",
            "name": "BNP Paribas SA",
            "ticker": "BNP.PA",
            "exchange": "Euronext Paris",
            "sector": "Financial Services",
            "industry": "Banks - Diversified",
            "security_type": "equity",
            "country": "FR",
            "currency": "EUR"
        },
        {
            "isin": "DE0007100000",
            "name": "Mercedes-Benz Group AG",
            "ticker": "MBG.DE",
            "exchange": "XETRA",
            "sector": "Consumer Cyclical",
            "industry": "Auto Manufacturers",
            "security_type": "equity",
            "country": "DE",
            "currency": "EUR"
        },
        {
            "isin": "GB0031348658",
            "name": "Barclays PLC",
            "ticker": "BARC.L",
            "exchange": "LSE",
            "sector": "Financial Services",
            "industry": "Banks - Diversified",
            "security_type": "equity",
            "country": "GB",
            "currency": "GBP"
        }
    ]
    
    # Add some bonds
    bonds = [
        {
            "isin": "US912810SU88",
            "name": "US Treasury 2.375% Aug 15 2042",
            "ticker": "US30Y",
            "exchange": "NYSE",
            "sector": "Fixed Income",
            "industry": "Government Bond",
            "security_type": "bond",
            "country": "US",
            "currency": "USD",
            "metadata": {
                "coupon": "2.375%",
                "maturity": "2042-08-15",
                "issuer": "United States Treasury"
            }
        },
        {
            "isin": "DE0001102580",
            "name": "German Bund 0.00% Feb 15 2031",
            "ticker": "BUND",
            "exchange": "EUREX",
            "sector": "Fixed Income",
            "industry": "Government Bond",
            "security_type": "bond",
            "country": "DE",
            "currency": "EUR",
            "metadata": {
                "coupon": "0.00%",
                "maturity": "2031-02-15",
                "issuer": "German Government"
            }
        },
        {
            "isin": "XS2082323630",
            "name": "Apple Inc. 1.375% Nov 17 2029",
            "ticker": "AAPL29",
            "exchange": "TRACE",
            "sector": "Fixed Income",
            "industry": "Corporate Bond",
            "security_type": "bond",
            "country": "US",
            "currency": "EUR",
            "metadata": {
                "coupon": "1.375%",
                "maturity": "2029-11-17",
                "issuer": "Apple Inc."
            }
        }
    ]
    
    # Add some ETFs
    etfs = [
        {
            "isin": "IE00B3XXRP09",
            "name": "Vanguard S&P 500 UCITS ETF",
            "ticker": "VUSA.L",
            "exchange": "LSE",
            "sector": "ETF",
            "industry": "Large Cap Blend Equity",
            "security_type": "etf",
            "country": "IE",
            "currency": "USD",
            "metadata": {
                "fund_family": "Vanguard",
                "expense_ratio": "0.07%",
                "benchmark": "S&P 500 Index"
            }
        },
        {
            "isin": "DE000A0H0744",
            "name": "iShares Core DAX UCITS ETF",
            "ticker": "EXS1.DE",
            "exchange": "XETRA",
            "sector": "ETF",
            "industry": "Large Cap Blend Equity",
            "security_type": "etf",
            "country": "DE",
            "currency": "EUR",
            "metadata": {
                "fund_family": "iShares",
                "expense_ratio": "0.16%",
                "benchmark": "DAX Index"
            }
        },
        {
            "isin": "JP3027650005",
            "name": "NEXT FUNDS TOPIX Exchange Traded Fund",
            "ticker": "1306.T",
            "exchange": "TSE",
            "sector": "ETF",
            "industry": "Large Cap Blend Equity",
            "security_type": "etf",
            "country": "JP",
            "currency": "JPY",
            "metadata": {
                "fund_family": "Nomura",
                "expense_ratio": "0.10%",
                "benchmark": "TOPIX Index"
            }
        }
    ]
    
    # Add all sample securities to the database
    for security in international_equities + bonds + etfs:
        db.add_security(security)
        
    logger.info(f"Added {len(international_equities + bonds + etfs)} sample securities")

def main():
    """Main function for the initialization script."""
    parser = argparse.ArgumentParser(description='Initialize Enhanced Securities Reference Database')
    parser.add_argument('--config', default='securities_db_config.json', help='Path to configuration file')
    parser.add_argument('--output', help='Path to save database file')
    parser.add_argument('--no-sample-data', action='store_true', help='Do not add sample data')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    # Initialize the database
    success = initialize_db(
        args.config,
        args.output,
        not args.no_sample_data
    )
    
    if success:
        print("Database initialized successfully")
        return 0
    else:
        print("Database initialization failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())