"""
ISIN Validator module.

This module provides functions to validate International Securities Identification Numbers (ISINs).
"""

import re
from typing import List, Dict, Any, Optional, Tuple


def is_valid_isin(isin: str) -> bool:
    """
    Validate an ISIN (International Securities Identification Number).
    
    An ISIN consists of:
    - A 2-letter country code
    - A 9-character alphanumeric national security identifier
    - A single check digit
    
    Args:
        isin: The ISIN to validate
        
    Returns:
        True if the ISIN is valid, False otherwise
    """
    # Check basic format
    if not isin or not isinstance(isin, str):
        return False
    
    # Remove any whitespace
    isin = isin.strip()
    
    # Check length and format
    if not re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', isin):
        return False
    
    # Check digit validation
    try:
        # Convert letters to numbers (A=10, B=11, ..., Z=35)
        values = []
        for char in isin[:-1]:  # Exclude check digit
            if char.isdigit():
                values.append(int(char))
            else:
                values.append(ord(char) - ord('A') + 10)
        
        # Double every second digit from right to left
        doubled_values = []
        for i, val in enumerate(reversed(values)):
            if i % 2 == 0:  # Even position from right
                doubled = val * 2
                if doubled > 9:
                    doubled = doubled % 10 + doubled // 10
                doubled_values.append(doubled)
            else:
                doubled_values.append(val)
        
        # Sum all digits
        total = sum(doubled_values)
        
        # Check digit is the amount needed to reach the next multiple of 10
        check_digit = (10 - (total % 10)) % 10
        
        return check_digit == int(isin[-1])
    except Exception as e:
        print(f"Error validating ISIN {isin}: {str(e)}")
        return False


def validate_isins(isins: List[str]) -> Dict[str, bool]:
    """
    Validate a list of ISINs.
    
    Args:
        isins: List of ISINs to validate
        
    Returns:
        Dictionary mapping each ISIN to its validity
    """
    return {isin: is_valid_isin(isin) for isin in isins}


def extract_isins(text: str) -> List[str]:
    """
    Extract ISINs from text.
    
    Args:
        text: Text to extract ISINs from
        
    Returns:
        List of extracted ISINs
    """
    # ISIN pattern
    pattern = r'[A-Z]{2}[A-Z0-9]{9}[0-9]'
    
    # Find all matches
    matches = re.findall(pattern, text)
    
    return matches


def extract_and_validate_isins(text: str) -> List[Dict[str, Any]]:
    """
    Extract and validate ISINs from text.
    
    Args:
        text: Text to extract ISINs from
        
    Returns:
        List of dictionaries containing ISIN and validity
    """
    isins = extract_isins(text)
    
    return [
        {
            'isin': isin,
            'is_valid': is_valid_isin(isin),
            'country_code': isin[:2]
        }
        for isin in isins
    ]


# Test function
def test_isin_validation():
    """
    Test the ISIN validation function with known valid and invalid ISINs.
    """
    # Valid ISINs
    valid_isins = [
        'US0378331005',  # Apple Inc.
        'GB0002634946',  # BAE Systems
        'CH0012032048',  # Roche
        'FR0000131104',  # BNP Paribas
        'DE000BAY0017',  # Bayer AG
        'JP3633400001',  # Toyota
        'IE00B4BNMY34',  # Accenture
        'AU000000BHP4',  # BHP Group
        'CA0679011084',  # Barrick Gold
        'ES0113900J37'   # Banco Santander
    ]
    
    # Invalid ISINs
    invalid_isins = [
        'US0378331006',  # Invalid check digit
        'GB000263494X',  # Invalid character
        'CH00120320',    # Too short
        'FR0000131104A', # Too long
        'DE000BAY001',   # Too short
        'JP363340000',   # Too short
        'IE00B4BNMY3',   # Too short
        'AU000000BHP',   # Too short
        'CA0679011085',  # Invalid check digit
        'ES0113900J38'   # Invalid check digit
    ]
    
    # Test valid ISINs
    for isin in valid_isins:
        result = is_valid_isin(isin)
        print(f"{isin}: {'Valid' if result else 'Invalid'}")
        assert result, f"ISIN {isin} should be valid"
    
    # Test invalid ISINs
    for isin in invalid_isins:
        result = is_valid_isin(isin)
        print(f"{isin}: {'Valid' if result else 'Invalid'}")
        assert not result, f"ISIN {isin} should be invalid"
    
    print("All tests passed!")


if __name__ == "__main__":
    test_isin_validation()
