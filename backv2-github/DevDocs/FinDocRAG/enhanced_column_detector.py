"""
Enhanced Column Detector for financial documents.

This module provides enhanced column type detection for financial tables.
"""

import re
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple

def detect_column_type(column: pd.Series) -> str:
    """
    Detect the type of a column with enhanced financial data recognition.

    Args:
        column: Column to analyze

    Returns:
        Column type as a string
    """
    # Remove NaN values
    values = column.dropna()

    if len(values) == 0:
        return "empty"
        
    # Get column name as string (if available)
    col_name = str(column.name).lower() if hasattr(column, 'name') else ""

    # Check if values match ISIN pattern (highest priority)
    isin_pattern = r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$'
    isin_ratio = sum(1 for val in values if re.match(isin_pattern, str(val))) / len(values)
    if isin_ratio > 0.5 or 'isin' in col_name:
        return "isin"

    # Check if values match currency code pattern
    currency_code_pattern = r'^[A-Z]{3}$'
    currency_code_ratio = sum(1 for val in values if re.match(currency_code_pattern, str(val))) / len(values)
    if currency_code_ratio > 0.5 or any(term in col_name for term in ['currency', 'ccy', 'curr']):
        return "currency_code"

    # Check if all values are dates
    try:
        pd.to_datetime(values)
        date_ratio = sum(1 for val in values if re.search(r'\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}', str(val))) / len(values)
        if date_ratio > 0.5 or any(term in col_name for term in ['date', 'maturity', 'due', 'expiry']):
            return "date"
    except:
        pass

    # Check for percentage values
    percentage_pattern = r'^[0-9.,\']+\s*%$'
    percentage_ratio = sum(1 for val in values if re.match(percentage_pattern, str(val))) / len(values)
    if percentage_ratio > 0.5 or '%' in col_name or any(term in col_name for term in ['weight', 'allocation', 'percentage']):
        return "percentage"

    # Check for price values
    price_pattern = r'^[$€£¥]?\s*[0-9.,\']+\s*[$€£¥]?$'
    price_ratio = sum(1 for val in values if re.match(price_pattern, str(val))) / len(values)
    if price_ratio > 0.5:
        # Check column name for price indicators
        if any(term in col_name for term in ['price', 'rate', 'cost', 'nav', 'value']):
            return "price"
        # Check column name for acquisition price indicators
        elif any(term in col_name for term in ['acquisition', 'purchase', 'buy', 'entry', 'average']):
            return "acquisition_price"
        # Check column name for value indicators
        elif any(term in col_name for term in ['value', 'valuation', 'market', 'total', 'worth', 'amount', 'countervalue']):
            return "value"
        else:
            return "numeric"

    # Check if all values are numeric
    try:
        pd.to_numeric(values)
        # Check column name for quantity indicators
        if any(term in col_name for term in ['nominal', 'quantity', 'amount', 'units', 'shares', 'position', 'volume']):
            return "quantity"
        else:
            return "numeric"
    except:
        pass

    # Check for description/name columns
    if any(term in col_name for term in ['name', 'description', 'security', 'designation', 'instrument']):
        return "description"

    # Check for coupon/interest rate columns
    if any(term in col_name for term in ['coupon', 'interest', 'yield', 'rate']) and percentage_ratio > 0.3:
        return "coupon"

    # Default to text
    return "text"

def detect_column_types(df: pd.DataFrame) -> Dict[Any, str]:
    """
    Detect column types in a DataFrame.

    Args:
        df: DataFrame to analyze

    Returns:
        Dictionary mapping column names to types
    """
    column_types = {}

    for col in df.columns:
        # Skip empty columns
        if df[col].isna().all():
            continue

        # Detect column type
        column_types[col] = detect_column_type(df[col])

    return column_types
