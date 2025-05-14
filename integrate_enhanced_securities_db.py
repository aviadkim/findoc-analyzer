#!/usr/bin/env python3
"""
Integration script for the Enhanced Securities Reference Database.

This script integrates the enhanced securities database with the existing
securities extractor to improve accuracy and completeness of extracted securities
information.
"""

import os
import sys
import json
import logging
import argparse
from typing import Dict, List, Any, Optional
from enhanced_securities_reference_db import SecuritiesReferenceDB
from enhanced_securities_extractor import SecurityExtractor

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('securities_db_integration')

class EnhancedSecurityExtractor(SecurityExtractor):
    """
    Enhanced version of the SecurityExtractor that uses the improved reference database.
    """
    
    def __init__(self, 
                 debug: bool = False, 
                 reference_db_path: Optional[str] = None, 
                 log_level: str = "INFO",
                 db_config_path: Optional[str] = None):
        """
        Initialize the EnhancedSecurityExtractor.
        
        Args:
            debug: Whether to print debug information
            reference_db_path: Optional path to securities reference database file
            log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            db_config_path: Optional path to database configuration file
        """
        # First initialize the parent class
        super().__init__(debug=debug, reference_db_path=reference_db_path, log_level=log_level)
        
        # Replace the basic securities database with the enhanced one
        self.securities_db = self._initialize_enhanced_db(db_config_path)
        
        # Add extra capabilities
        self._setup_enhanced_capabilities()
        
        logger.info("EnhancedSecurityExtractor initialized with improved reference database")
    
    def _initialize_enhanced_db(self, config_path: Optional[str] = None) -> SecuritiesReferenceDB:
        """
        Initialize the enhanced securities reference database.
        
        Args:
            config_path: Optional path to configuration file
            
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
        logger.info(f"Initializing enhanced securities database with config from {config_path}")
        return SecuritiesReferenceDB(config_path)
    
    def _setup_enhanced_capabilities(self) -> None:
        """Set up enhanced capabilities using the improved database."""
        # Add additional document types
        self.doc_type_currency_map.update({
            "credit_suisse": "CHF",
            "deutsche_bank": "EUR",
            "nomura": "JPY",
            "soc_gen": "EUR",
            "barclays": "GBP",
            "hsbc": "GBP",
            "bnp_paribas": "EUR",
            "goldman_sachs": "USD",
            "jpmorgan": "USD",
            "robinhood": "USD",
            "degiro": "EUR",
            "ing": "EUR",
            "saxo_bank": "EUR"
        })
    
    def _post_process_securities(self, securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Post-process securities with enhanced database capabilities.
        
        Args:
            securities: List of securities to process
            
        Returns:
            Processed list of securities
        """
        # Call the parent method first for basic processing
        processed_securities = super()._post_process_securities(securities)
        
        # Then apply enhanced processing
        for security in processed_securities:
            self._enhance_security_data(security)
        
        return processed_securities
    
    def _enhance_security_data(self, security: Dict[str, Any]) -> None:
        """
        Enhance a security with additional data from the reference database.
        
        Args:
            security: Security data to enhance
        """
        isin = security.get('isin')
        if not isin:
            # Try to find ISIN by name
            if security.get('description'):
                isin_by_name = self.securities_db.get_isin_by_name(security['description'])
                if isin_by_name:
                    security['isin'] = isin_by_name
                    isin = isin_by_name
        
        if isin:
            # Add additional data from enhanced database
            if 'sector' not in security:
                sector = self.securities_db.get_sector(isin)
                if sector:
                    security['sector'] = sector
            
            if 'industry' not in security:
                industry = self.securities_db.get_industry(isin)
                if industry:
                    security['industry'] = industry
            
            if 'security_type' not in security and 'type' not in security:
                security_type = self.securities_db.get_security_type(isin)
                if security_type:
                    security['type'] = security_type
            
            if 'country' not in security:
                country = self.securities_db.get_country(isin)
                if country:
                    security['country'] = country
            
            if 'currency' not in security:
                currency = self.securities_db.get_currency(isin)
                if currency:
                    security['currency'] = currency
            
            if 'exchange' not in security:
                exchange = self.securities_db.get_exchange(isin)
                if exchange:
                    security['exchange'] = exchange
            
            # Add ticker if missing
            if 'ticker' not in security:
                ticker = self.securities_db.get_ticker_by_isin(isin)
                if ticker:
                    security['ticker'] = ticker
        
        # If no ISIN but we have a description, try to enhance based on name
        elif security.get('description'):
            # Try fuzzy matching
            best_match = self.securities_db.find_best_match_for_name(security['description'])
            if best_match:
                # Update security with matched data
                security['isin'] = best_match['isin']
                security['name_source'] = 'fuzzy_match'
                
                # Update description if the match is high quality
                if best_match.get('match_quality') == 'exact' or \
                   (best_match.get('match_quality') == 'fuzzy' and 
                    'score' in best_match and best_match['score'] > 0.8):
                    security['description'] = best_match['name']
                
                # Add other data from match
                if 'ticker' not in security and 'ticker' in best_match:
                    security['ticker'] = best_match['ticker']
                
                if 'sector' not in security and best_match.get('sector'):
                    security['sector'] = best_match['sector']
                
                if 'industry' not in security and best_match.get('industry'):
                    security['industry'] = best_match['industry']
                
                if 'type' not in security and best_match.get('security_type'):
                    security['type'] = best_match['security_type']
        
        # If we have a ticker but no ISIN, try to get ISIN by ticker
        elif security.get('ticker'):
            isin_by_ticker = self.securities_db.get_isin_by_ticker(security['ticker'])
            if isin_by_ticker:
                security['isin'] = isin_by_ticker
                # Recursively call to add other data
                self._enhance_security_data(security)
        
        # Detect security type from description if still missing
        if 'type' not in security and security.get('description'):
            security_type = self.securities_db.detect_security_type(security['description'])
            if security_type:
                security['type'] = security_type

def process_pdf_with_enhanced_extractor(pdf_path: str, 
                                       db_config_path: Optional[str] = None,
                                       output_path: Optional[str] = None,
                                       debug: bool = False) -> Dict[str, Any]:
    """
    Process a PDF with the enhanced security extractor.
    
    Args:
        pdf_path: Path to the PDF file
        db_config_path: Optional path to database configuration file
        output_path: Optional path to save the output
        debug: Whether to print debug information
        
    Returns:
        Dictionary containing extracted information
    """
    # Validate input
    if not os.path.exists(pdf_path):
        logger.error(f"PDF file not found: {pdf_path}")
        return {"error": f"PDF file not found: {pdf_path}"}
    
    # Initialize the enhanced extractor
    extractor = EnhancedSecurityExtractor(
        debug=debug,
        db_config_path=db_config_path,
        log_level="DEBUG" if debug else "INFO"
    )
    
    # Process the PDF
    logger.info(f"Processing PDF: {pdf_path}")
    result = extractor.extract_from_pdf(pdf_path)
    
    # Save output if requested
    if output_path:
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Results saved to {output_path}")
        except Exception as e:
            logger.error(f"Error saving results: {e}")
    
    return result

def compare_extraction_results(basic_extractor_result: Dict[str, Any], 
                               enhanced_extractor_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compare the results from basic and enhanced extractors.
    
    Args:
        basic_extractor_result: Result from the basic extractor
        enhanced_extractor_result: Result from the enhanced extractor
        
    Returns:
        Dictionary with comparison statistics
    """
    comparison = {
        "basic": {
            "document_type": basic_extractor_result.get("document_type", "unknown"),
            "security_count": len(basic_extractor_result.get("securities", [])),
            "complete_securities": 0,
            "securities_with_isin": 0,
            "securities_with_name": 0,
            "securities_with_value": 0,
            "securities_with_type": 0
        },
        "enhanced": {
            "document_type": enhanced_extractor_result.get("document_type", "unknown"),
            "security_count": len(enhanced_extractor_result.get("securities", [])),
            "complete_securities": 0,
            "securities_with_isin": 0,
            "securities_with_name": 0,
            "securities_with_value": 0,
            "securities_with_type": 0,
            "securities_with_sector": 0,
            "securities_with_industry": 0,
            "securities_with_country": 0,
            "securities_with_ticker": 0
        },
        "improvement": {}
    }
    
    # Analyze basic extractor results
    for security in basic_extractor_result.get("securities", []):
        # Count securities with key data
        if security.get("isin"):
            comparison["basic"]["securities_with_isin"] += 1
        
        if security.get("description"):
            comparison["basic"]["securities_with_name"] += 1
        
        if security.get("value") is not None:
            comparison["basic"]["securities_with_value"] += 1
        
        if security.get("type"):
            comparison["basic"]["securities_with_type"] += 1
        
        # Count complete securities
        if (security.get("isin") and security.get("description") and 
            security.get("value") is not None and security.get("type")):
            comparison["basic"]["complete_securities"] += 1
    
    # Analyze enhanced extractor results
    for security in enhanced_extractor_result.get("securities", []):
        # Count securities with key data
        if security.get("isin"):
            comparison["enhanced"]["securities_with_isin"] += 1
        
        if security.get("description"):
            comparison["enhanced"]["securities_with_name"] += 1
        
        if security.get("value") is not None:
            comparison["enhanced"]["securities_with_value"] += 1
        
        if security.get("type"):
            comparison["enhanced"]["securities_with_type"] += 1
        
        # Count enhanced data
        if security.get("sector"):
            comparison["enhanced"]["securities_with_sector"] += 1
        
        if security.get("industry"):
            comparison["enhanced"]["securities_with_industry"] += 1
        
        if security.get("country"):
            comparison["enhanced"]["securities_with_country"] += 1
        
        if security.get("ticker"):
            comparison["enhanced"]["securities_with_ticker"] += 1
        
        # Count complete securities
        if (security.get("isin") and security.get("description") and 
            security.get("value") is not None and security.get("type")):
            comparison["enhanced"]["complete_securities"] += 1
    
    # Calculate improvements
    basic_security_count = comparison["basic"]["security_count"]
    enhanced_security_count = comparison["enhanced"]["security_count"]
    
    if basic_security_count > 0 and enhanced_security_count > 0:
        # Calculate improvement percentages
        basic_complete_pct = (comparison["basic"]["complete_securities"] / basic_security_count) * 100
        enhanced_complete_pct = (comparison["enhanced"]["complete_securities"] / enhanced_security_count) * 100
        
        comparison["improvement"] = {
            "security_count_change": enhanced_security_count - basic_security_count,
            "security_count_pct": ((enhanced_security_count - basic_security_count) / basic_security_count) * 100 if basic_security_count > 0 else 0,
            "complete_securities_change": comparison["enhanced"]["complete_securities"] - comparison["basic"]["complete_securities"],
            "complete_securities_pct_change": enhanced_complete_pct - basic_complete_pct,
            "isin_coverage_pct": (comparison["enhanced"]["securities_with_isin"] / enhanced_security_count) * 100 if enhanced_security_count > 0 else 0,
            "name_coverage_pct": (comparison["enhanced"]["securities_with_name"] / enhanced_security_count) * 100 if enhanced_security_count > 0 else 0,
            "type_coverage_pct": (comparison["enhanced"]["securities_with_type"] / enhanced_security_count) * 100 if enhanced_security_count > 0 else 0,
            "additional_data": {
                "sector_coverage_pct": (comparison["enhanced"]["securities_with_sector"] / enhanced_security_count) * 100 if enhanced_security_count > 0 else 0,
                "industry_coverage_pct": (comparison["enhanced"]["securities_with_industry"] / enhanced_security_count) * 100 if enhanced_security_count > 0 else 0,
                "country_coverage_pct": (comparison["enhanced"]["securities_with_country"] / enhanced_security_count) * 100 if enhanced_security_count > 0 else 0,
                "ticker_coverage_pct": (comparison["enhanced"]["securities_with_ticker"] / enhanced_security_count) * 100 if enhanced_security_count > 0 else 0
            }
        }
    
    return comparison

def demonstrate_enhancement(pdf_path: str, db_config_path: Optional[str] = None, debug: bool = False) -> None:
    """
    Demonstrate the enhancement by comparing basic and enhanced extractors.
    
    Args:
        pdf_path: Path to the PDF file
        db_config_path: Optional path to database configuration file
        debug: Whether to print debug information
    """
    print(f"\n--- ENHANCEMENT DEMONSTRATION FOR: {os.path.basename(pdf_path)} ---")
    
    # Initialize basic extractor
    basic_extractor = SecurityExtractor(debug=debug, log_level="DEBUG" if debug else "INFO")
    
    # Initialize enhanced extractor
    enhanced_extractor = EnhancedSecurityExtractor(
        debug=debug,
        db_config_path=db_config_path,
        log_level="DEBUG" if debug else "INFO"
    )
    
    # Process with basic extractor
    print("\nProcessing with basic extractor...")
    basic_result = basic_extractor.extract_from_pdf(pdf_path)
    
    # Process with enhanced extractor
    print("\nProcessing with enhanced extractor...")
    enhanced_result = enhanced_extractor.extract_from_pdf(pdf_path)
    
    # Compare results
    comparison = compare_extraction_results(basic_result, enhanced_result)
    
    # Print comparison
    print("\nComparison of extraction results:")
    
    print(f"\nBasic Extractor:")
    print(f"  Document Type: {comparison['basic']['document_type']}")
    print(f"  Total Securities: {comparison['basic']['security_count']}")
    print(f"  Complete Securities: {comparison['basic']['complete_securities']} " +
          f"({(comparison['basic']['complete_securities'] / comparison['basic']['security_count']) * 100:.1f}% if comparison['basic']['security_count'] > 0 else 0)")
    print(f"  Securities with ISIN: {comparison['basic']['securities_with_isin']}")
    print(f"  Securities with Name: {comparison['basic']['securities_with_name']}")
    print(f"  Securities with Value: {comparison['basic']['securities_with_value']}")
    print(f"  Securities with Type: {comparison['basic']['securities_with_type']}")
    
    print(f"\nEnhanced Extractor:")
    print(f"  Document Type: {comparison['enhanced']['document_type']}")
    print(f"  Total Securities: {comparison['enhanced']['security_count']}")
    print(f"  Complete Securities: {comparison['enhanced']['complete_securities']} " +
          f"({(comparison['enhanced']['complete_securities'] / comparison['enhanced']['security_count']) * 100:.1f}% if comparison['enhanced']['security_count'] > 0 else 0)")
    print(f"  Securities with ISIN: {comparison['enhanced']['securities_with_isin']}")
    print(f"  Securities with Name: {comparison['enhanced']['securities_with_name']}")
    print(f"  Securities with Value: {comparison['enhanced']['securities_with_value']}")
    print(f"  Securities with Type: {comparison['enhanced']['securities_with_type']}")
    print(f"  Securities with Sector: {comparison['enhanced']['securities_with_sector']}")
    print(f"  Securities with Industry: {comparison['enhanced']['securities_with_industry']}")
    print(f"  Securities with Country: {comparison['enhanced']['securities_with_country']}")
    print(f"  Securities with Ticker: {comparison['enhanced']['securities_with_ticker']}")
    
    if 'improvement' in comparison and comparison['improvement']:
        print(f"\nImprovements:")
        improvement = comparison['improvement']
        
        print(f"  Security Count Change: {improvement['security_count_change']} ({improvement['security_count_pct']:.1f}%)")
        print(f"  Complete Securities Change: {improvement['complete_securities_change']} ({improvement['complete_securities_pct_change']:.1f}%)")
        print(f"  ISIN Coverage: {improvement['isin_coverage_pct']:.1f}%")
        print(f"  Name Coverage: {improvement['name_coverage_pct']:.1f}%")
        print(f"  Type Coverage: {improvement['type_coverage_pct']:.1f}%")
        
        additional = improvement.get('additional_data', {})
        print(f"  Additional Data Coverage:")
        print(f"    Sector: {additional.get('sector_coverage_pct', 0):.1f}%")
        print(f"    Industry: {additional.get('industry_coverage_pct', 0):.1f}%")
        print(f"    Country: {additional.get('country_coverage_pct', 0):.1f}%")
        print(f"    Ticker: {additional.get('ticker_coverage_pct', 0):.1f}%")
    
    # Sample of improved data
    print("\nSample of enhanced security data:")
    for i, security in enumerate(enhanced_result.get("securities", [])[:3]):
        print(f"\nSecurity {i+1}:")
        for key, value in security.items():
            if key != 'details':  # Skip detailed text
                print(f"  {key}: {value}")

def main():
    """Main function for the integration script."""
    parser = argparse.ArgumentParser(description='Integrate Enhanced Securities Reference Database')
    parser.add_argument('--pdf', help='Path to PDF file for processing')
    parser.add_argument('--config', help='Path to database configuration file')
    parser.add_argument('--output', help='Path to save output JSON')
    parser.add_argument('--compare', action='store_true', help='Compare basic and enhanced extractors')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    # PDF path is required
    if not args.pdf:
        logger.error("PDF path is required")
        parser.print_help()
        sys.exit(1)
    
    # Check if PDF exists
    if not os.path.exists(args.pdf):
        logger.error(f"PDF file not found: {args.pdf}")
        sys.exit(1)
    
    # Check if config exists if provided
    if args.config and not os.path.exists(args.config):
        logger.warning(f"Config file not found: {args.config}")
    
    if args.compare:
        # Run demonstration
        demonstrate_enhancement(args.pdf, args.config, args.verbose)
    else:
        # Process the PDF
        result = process_pdf_with_enhanced_extractor(
            args.pdf,
            args.config,
            args.output,
            args.verbose
        )
        
        # Print summary if output not specified
        if not args.output:
            print(f"\nProcessed {args.pdf}")
            print(f"Document Type: {result.get('document_type', 'unknown')}")
            print(f"Found {len(result.get('securities', []))} securities")
            
            # Print first few securities
            for i, security in enumerate(result.get("securities", [])[:3]):
                print(f"\nSecurity {i+1}:")
                for key, value in security.items():
                    if key != 'details':  # Skip detailed text
                        print(f"  {key}: {value}")
            
            if len(result.get("securities", [])) > 3:
                print(f"\n... and {len(result.get('securities', [])) - 3} more.")

if __name__ == "__main__":
    main()