"""
Enhanced ISIN Extractor Service

This service provides advanced ISIN (International Securities Identification Number) extraction
and validation capabilities, supporting:
- Regular expression pattern matching with advanced validation
- Contextual ISIN detection using surrounding text
- Support for multiple formats (with or without spaces/formatting)
- Validation using standard ISIN verification algorithm
- Additional security identifier support (CUSIP, SEDOL)
- Financial security metadata enrichment
"""

import re
import logging
import json
import requests
from typing import List, Dict, Any, Optional, Tuple, Set
from datetime import datetime
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ISINExtractorService:
    def __init__(self, api_key=None, cache_dir=None):
        """
        Initialize the ISIN Extractor Service
        
        Args:
            api_key: Optional API key for security data enrichment services
            cache_dir: Directory to cache security data
        """
        self.api_key = api_key
        self.cache_dir = cache_dir
        if cache_dir and not os.path.exists(cache_dir):
            os.makedirs(cache_dir, exist_ok=True)
        
        # Regular expression patterns for security identifiers
        self.isin_pattern = re.compile(r'\b[A-Z]{2}[A-Z0-9]{9}\d\b')
        self.cusip_pattern = re.compile(r'\b[0-9A-Z]{9}\b')
        self.sedol_pattern = re.compile(r'\b[0-9A-Z]{7}\b')
        
        # Context patterns to improve accuracy (common text near ISINs)
        self.context_patterns = [
            r'ISIN[:\s]+([A-Z]{2}[A-Z0-9]{9}\d)',
            r'International\s+Securities\s+Identification\s+Number[:\s]+([A-Z]{2}[A-Z0-9]{9}\d)',
            r'Security\s+ID[:\s]+([A-Z]{2}[A-Z0-9]{9}\d)',
            r'([A-Z]{2}[A-Z0-9]{9}\d)[\s\)]',
            r'ID:\s*([A-Z]{2}[A-Z0-9]{9}\d)',
            r'No\.?\s*([A-Z]{2}[A-Z0-9]{9}\d)',
            r'Code:?\s*([A-Z]{2}[A-Z0-9]{9}\d)',
            r'Symbol:?\s*([A-Z]{2}[A-Z0-9]{9}\d)',
        ]
        
        # Known country codes for validation
        self.country_codes = set([
            'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
            'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
            'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
            'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
            'EG', 'EH', 'ER', 'ES', 'ET', 'EU', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE',
            'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK',
            'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE',
            'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB',
            'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH',
            'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
            'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF',
            'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU',
            'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR',
            'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN',
            'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG',
            'VI', 'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
        ])
        
        # Cache for security data
        self.security_cache = {}
        
        # Load cache if exists
        self._load_cache()

    def _load_cache(self):
        """Load the security cache from disk if available"""
        if self.cache_dir:
            cache_file = os.path.join(self.cache_dir, 'security_cache.json')
            if os.path.exists(cache_file):
                try:
                    with open(cache_file, 'r') as f:
                        self.security_cache = json.load(f)
                    logger.info(f"Loaded {len(self.security_cache)} securities from cache")
                except Exception as e:
                    logger.error(f"Error loading security cache: {e}")

    def _save_cache(self):
        """Save the security cache to disk"""
        if self.cache_dir:
            cache_file = os.path.join(self.cache_dir, 'security_cache.json')
            try:
                with open(cache_file, 'w') as f:
                    json.dump(self.security_cache, f)
                logger.info(f"Saved {len(self.security_cache)} securities to cache")
            except Exception as e:
                logger.error(f"Error saving security cache: {e}")

    def extract_isins(self, text: str) -> List[str]:
        """
        Extract all potential ISIN codes from text
        
        Args:
            text: The text to search for ISINs
            
        Returns:
            A list of ISIN codes found in the text
        """
        # Clean text - remove hyphens, spaces, etc. that might break the pattern
        cleaned_text = self._clean_text(text)
        
        # Find all potential ISINs using regex
        potential_isins = self.isin_pattern.findall(cleaned_text)
        
        # Search for ISINs in contextual patterns
        for pattern in self.context_patterns:
            matches = re.findall(pattern, cleaned_text)
            potential_isins.extend(matches)
        
        # Deduplicate and validate ISINs
        valid_isins = []
        for isin in set(potential_isins):
            if self.validate_isin(isin):
                valid_isins.append(isin)
        
        return valid_isins

    def extract_securities(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Extract and categorize all security identifiers in the text
        
        Args:
            text: The text to search for security identifiers
            
        Returns:
            A dictionary with categorized security identifiers
        """
        # Clean text
        cleaned_text = self._clean_text(text)
        
        # Find all security identifiers
        isins = [isin for isin in self.isin_pattern.findall(cleaned_text) if self.validate_isin(isin)]
        cusips = [cusip for cusip in self.cusip_pattern.findall(cleaned_text) if self._is_potential_cusip(cusip)]
        sedols = [sedol for sedol in self.sedol_pattern.findall(cleaned_text) if self._is_potential_sedol(sedol)]
        
        # Extract contextual securities (ISINs with context)
        contextual_isins = []
        for pattern in self.context_patterns:
            for match in re.finditer(pattern, cleaned_text):
                if match.groups():
                    isin = match.group(1)
                    if self.validate_isin(isin) and isin not in isins:
                        contextual_isins.append(isin)
        
        # Combine all ISINs
        all_isins = isins + contextual_isins
        
        # Return categorized results
        return {
            'isins': all_isins,
            'cusips': cusips,
            'sedols': sedols
        }

    def _clean_text(self, text: str) -> str:
        """
        Clean text for better security identifier extraction
        
        Args:
            text: The text to clean
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        # Replace common character issues
        result = text.replace('-', '')  # Remove hyphens
        result = result.replace(' ', '')  # Remove spaces
        result = result.replace('\n', ' ')  # Replace newlines with spaces
        result = result.replace('\t', ' ')  # Replace tabs with spaces
        
        # Re-insert spaces after potential identifiers to help with regex boundary matching
        result = re.sub(r'([A-Z]{2}[A-Z0-9]{9}\d)', r'\1 ', result)  # ISIN
        result = re.sub(r'([0-9A-Z]{9})', r'\1 ', result)  # CUSIP
        result = re.sub(r'([0-9A-Z]{7})', r'\1 ', result)  # SEDOL
        
        return result

    def validate_isin(self, isin: str) -> bool:
        """
        Validate an ISIN code using the ISO 6166 standard
        
        Args:
            isin: ISIN code to validate
            
        Returns:
            True if valid, False otherwise
        """
        if not isin or not isinstance(isin, str):
            return False
        
        # Check format: 12 characters, starting with 2 letters
        if not re.match(r'^[A-Z]{2}[A-Z0-9]{9}\d$', isin):
            return False
        
        # Check country code
        country_code = isin[:2]
        if country_code not in self.country_codes:
            return False
        
        # Check checksum using Luhn algorithm (mod 10)
        isin_digits = []
        for char in isin[:-1]:  # Exclude the check digit
            if char.isdigit():
                isin_digits.append(int(char))
            else:  # Convert letters to numbers (A=10, B=11, etc.)
                isin_digits.append(ord(char) - 55)
        
        # Convert to string
        digits_str = ''.join(str(d) for d in isin_digits)
        
        # Apply Luhn algorithm
        total = 0
        for i, digit in enumerate(reversed(digits_str)):
            d = int(digit)
            if i % 2 == 1:  # Odd positions (from right)
                d *= 2
                if d > 9:
                    d -= 9
            total += d
        
        # Calculate check digit
        check_digit = (10 - (total % 10)) % 10
        
        # Compare with actual check digit
        return check_digit == int(isin[-1])

    def _is_potential_cusip(self, cusip: str) -> bool:
        """
        Check if a string is potentially a valid CUSIP
        
        Args:
            cusip: CUSIP to validate
            
        Returns:
            True if potentially valid, False otherwise
        """
        if not cusip or not isinstance(cusip, str):
            return False
        
        # Basic format check: 9 characters
        if not re.match(r'^[0-9A-Z]{9}$', cusip):
            return False
        
        # Check for common CUSIP patterns
        # First 6 characters are usually alphanumeric issuer code
        # Characters 7-8 are usually issue number
        # Character 9 is check digit
        
        # Simple heuristic: Avoid false positives by checking for typical patterns
        # Avoid all digits (likely a number)
        if cusip.isdigit():
            return False
        
        # Avoid all letters (likely a word)
        if cusip.isalpha():
            return False
        
        # More sophisticated validation would require check digit verification
        # For now, just return true for potential matches
        return True

    def _is_potential_sedol(self, sedol: str) -> bool:
        """
        Check if a string is potentially a valid SEDOL
        
        Args:
            sedol: SEDOL to validate
            
        Returns:
            True if potentially valid, False otherwise
        """
        if not sedol or not isinstance(sedol, str):
            return False
        
        # Basic format check: 7 characters
        if not re.match(r'^[0-9A-Z]{7}$', sedol):
            return False
        
        # Check for common SEDOL patterns
        # First 6 characters are the base code
        # Character 7 is the check digit
        
        # Simple heuristic: Avoid false positives
        # Avoid all digits (likely a number)
        if sedol.isdigit():
            return False
        
        # Avoid all letters (likely a word)
        if sedol.isalpha():
            return False
        
        # More sophisticated validation would require check digit verification
        # For now, just return true for potential matches
        return True

    def enrich_security_data(self, security_id: str, id_type: str = 'isin') -> Optional[Dict[str, Any]]:
        """
        Enrich security data with metadata from external API or cache
        
        Args:
            security_id: The security identifier (ISIN, CUSIP, SEDOL)
            id_type: Type of identifier ('isin', 'cusip', 'sedol')
            
        Returns:
            Enriched security data or None if not available
        """
        # Check cache first
        cache_key = f"{id_type}_{security_id}"
        if cache_key in self.security_cache:
            return self.security_cache[cache_key]
        
        # If no API key, return minimal data
        if not self.api_key:
            # For ISINs, extract country code and base code
            if id_type == 'isin' and self.validate_isin(security_id):
                return {
                    'isin': security_id,
                    'country_code': security_id[:2],
                    'base_code': security_id[2:11],
                    'check_digit': security_id[11]
                }
            return None
        
        # Try to fetch from external API
        try:
            # This is a placeholder - replace with actual API implementation
            # For example, you might use OpenFIGI API, Bloomberg API, etc.
            api_url = "https://api.example.com/securities"
            params = {
                'identifier': security_id,
                'idType': id_type,
                'apiKey': self.api_key
            }
            
            # Mock response for now (in real implementation, use requests.get)
            # response = requests.get(api_url, params=params)
            # if response.status_code == 200:
            #     data = response.json()
            
            # Mock data for demonstration
            data = self._mock_security_data(security_id, id_type)
            
            # Cache the result
            if data:
                self.security_cache[cache_key] = data
                self._save_cache()
                
            return data
            
        except Exception as e:
            logger.error(f"Error fetching security data: {e}")
            return None

    def _mock_security_data(self, security_id: str, id_type: str) -> Dict[str, Any]:
        """
        Create mock security data for demonstration
        
        Args:
            security_id: The security identifier
            id_type: Type of identifier
            
        Returns:
            Mock security data
        """
        # For ISINs
        if id_type == 'isin' and len(security_id) == 12:
            country_code = security_id[:2]
            
            # Common country prefixes
            country_map = {
                'US': 'United States',
                'GB': 'United Kingdom',
                'DE': 'Germany',
                'FR': 'France',
                'JP': 'Japan',
                'CH': 'Switzerland',
                'CA': 'Canada',
                'AU': 'Australia',
                'IL': 'Israel',
                'CN': 'China'
            }
            
            # Generate mock security data based on prefix
            security_types = {
                'US': ['Common Stock', 'ETF', 'Corporate Bond', 'Treasury Bond'],
                'GB': ['Ordinary Share', 'GDR', 'UK Gilt'],
                'DE': ['Common Share', 'ETF', 'Government Bond'],
                'FR': ['Ordinary Share', 'Government Bond'],
                'JP': ['Common Stock', 'Government Bond'],
                'CH': ['Registered Share', 'Bond'],
                'CA': ['Common Share', 'Government Bond'],
                'AU': ['Ordinary Share', 'Government Bond'],
                'IL': ['Ordinary Share', 'Government Bond'],
                'CN': ['A-Share', 'Government Bond']
            }
            
            # Generate a plausible security name and type
            country = country_map.get(country_code, 'Unknown')
            security_type = security_types.get(country_code, ['Security'])[0]
            company_prefix = "ABC Corp" if security_type in ["Common Stock", "Ordinary Share"] else "XYZ Fund"
            
            return {
                'isin': security_id,
                'country_code': country_code,
                'country': country,
                'base_code': security_id[2:11],
                'check_digit': security_id[11],
                'name': f"{company_prefix} {security_id[2:6]}",
                'type': security_type,
                'currency': 'USD' if country_code == 'US' else ('GBP' if country_code == 'GB' else 'EUR'),
                'exchange': 'NYSE' if country_code == 'US' else ('LSE' if country_code == 'GB' else 'Local Exchange'),
                'price_date': datetime.now().strftime('%Y-%m-%d'),
                'mock_data': True
            }
        
        # Default response
        return {
            'id': security_id,
            'id_type': id_type,
            'mock_data': True
        }

    def extract_and_enrich(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Extract all security identifiers and enrich them with metadata
        
        Args:
            text: The text to search for security identifiers
            
        Returns:
            Dictionary with enriched security data
        """
        # Extract all security identifiers
        securities = self.extract_securities(text)
        
        # Enrich each identifier
        enriched = {
            'isins': [self.enrich_security_data(isin, 'isin') for isin in securities['isins']],
            'cusips': [self.enrich_security_data(cusip, 'cusip') for cusip in securities['cusips']],
            'sedols': [self.enrich_security_data(sedol, 'sedol') for sedol in securities['sedols']]
        }
        
        # Filter out None values
        enriched = {
            k: [item for item in v if item is not None]
            for k, v in enriched.items()
        }
        
        return enriched

# Usage example:
if __name__ == "__main__":
    # Create service
    service = ISINExtractorService(cache_dir="./cache")
    
    # Sample text with ISIN codes
    sample_text = """
    This is a sample document with some ISIN codes.
    Stock A has ISIN: US0378331005 (Apple Inc.)
    Bond B has code DE0001102341
    Security ID: FR0000131104
    Some text with an embedded ISIN GB0002634946 in the middle.
    
    This is a CUSIP: 037833100
    This is a SEDOL: 2588173
    
    Invalid ISIN: US0378331009 (wrong check digit)
    """
    
    # Extract ISINs
    isins = service.extract_isins(sample_text)
    print(f"Found {len(isins)} valid ISINs: {isins}")
    
    # Extract all securities
    securities = service.extract_securities(sample_text)
    print(f"Found securities: {securities}")
    
    # Extract and enrich
    enriched = service.extract_and_enrich(sample_text)
    print(f"Enriched securities: {json.dumps(enriched, indent=2)}")
