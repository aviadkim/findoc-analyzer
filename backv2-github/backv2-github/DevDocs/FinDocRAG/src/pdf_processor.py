"""
PDF Processor Module

This module provides functions for processing PDF files, extracting text, tables,
and financial data such as ISINs and security details.
"""
import os
import re
import json
import fitz  # PyMuPDF
import pandas as pd
import numpy as np
from datetime import datetime

# Regular expression for ISIN (International Securities Identification Number)
ISIN_PATTERN = r'[A-Z]{2}[A-Z0-9]{9}[0-9]'

class PDFProcessor:
    """Class for processing PDF files and extracting financial data."""
    
    def __init__(self, upload_folder='./uploads', temp_folder='./temp', results_folder='./results'):
        """Initialize the PDF processor with folder paths."""
        self.upload_folder = upload_folder
        self.temp_folder = temp_folder
        self.results_folder = results_folder
        
        # Create folders if they don't exist
        os.makedirs(upload_folder, exist_ok=True)
        os.makedirs(temp_folder, exist_ok=True)
        os.makedirs(results_folder, exist_ok=True)
    
    def extract_text(self, pdf_path):
        """Extract text from a PDF file."""
        text = ""
        try:
            doc = fitz.open(pdf_path)
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""
    
    def extract_isins(self, text):
        """Extract ISINs from text using regex."""
        isins = re.findall(ISIN_PATTERN, text)
        # Remove duplicates while preserving order
        unique_isins = []
        for isin in isins:
            if isin not in unique_isins:
                unique_isins.append(isin)
        return unique_isins
    
    def is_valid_isin(self, isin):
        """Validate an ISIN using the Luhn algorithm."""
        if not re.match(ISIN_PATTERN, isin):
            return False
        
        # Convert letters to numbers according to ISO 6166
        chars = []
        for char in isin:
            if char.isalpha():
                chars.append(str(ord(char) - ord('A') + 10))
            else:
                chars.append(char)
        
        # Apply Luhn algorithm
        digits = ''.join(chars)
        checksum = 0
        for i, digit in enumerate(reversed(digits)):
            value = int(digit)
            if i % 2 == 1:
                value *= 2
                if value > 9:
                    value -= 9
            checksum += value
        
        return checksum % 10 == 0
    
    def extract_tables(self, pdf_path):
        """Extract tables from a PDF file using PyMuPDF."""
        tables = []
        try:
            doc = fitz.open(pdf_path)
            for page_num, page in enumerate(doc):
                # Extract tables using PyMuPDF's built-in table detection
                tab = page.find_tables()
                if tab.tables:
                    for table in tab.tables:
                        df = pd.DataFrame(table.extract())
                        tables.append({
                            'page': page_num + 1,
                            'data': df.to_dict(orient='records')
                        })
            doc.close()
            return tables
        except Exception as e:
            print(f"Error extracting tables from PDF: {e}")
            return []
    
    def extract_security_details(self, text, isins):
        """Extract security details for each ISIN."""
        securities = []
        
        # Simple extraction based on proximity to ISIN
        lines = text.split('\n')
        for isin in isins:
            if not self.is_valid_isin(isin):
                continue
                
            security = {
                'identifier': isin,
                'name': 'Unknown',
                'security_type': 'Unknown',
                'asset_class': 'Unknown',
                'quantity': 0,
                'value': 0.0,
                'risk_level': 'Medium'
            }
            
            # Find the line containing the ISIN
            isin_line_idx = -1
            for i, line in enumerate(lines):
                if isin in line:
                    isin_line_idx = i
                    break
            
            if isin_line_idx >= 0:
                # Look for security name in nearby lines
                for i in range(max(0, isin_line_idx - 3), min(len(lines), isin_line_idx + 4)):
                    line = lines[i]
                    
                    # Skip lines that are too short or just contain the ISIN
                    if len(line.strip()) < 5 or line.strip() == isin:
                        continue
                    
                    # If line doesn't contain the ISIN, it might have the name
                    if isin not in line and len(line.strip()) > 10:
                        security['name'] = line.strip()
                        break
                
                # Look for quantity and value in nearby lines
                for i in range(max(0, isin_line_idx - 5), min(len(lines), isin_line_idx + 6)):
                    line = lines[i].strip()
                    
                    # Look for numbers that might be quantity or value
                    numbers = re.findall(r'[\d,]+\.?\d*', line)
                    if len(numbers) >= 1:
                        # First number might be quantity
                        try:
                            security['quantity'] = float(numbers[0].replace(',', ''))
                        except:
                            pass
                    
                    if len(numbers) >= 2:
                        # Second number might be value
                        try:
                            security['value'] = float(numbers[1].replace(',', ''))
                        except:
                            pass
                
                # Determine security type and asset class based on ISIN and name
                if 'bond' in security['name'].lower() or 'treasury' in security['name'].lower():
                    security['security_type'] = 'Bond'
                    security['asset_class'] = 'Fixed Income'
                    security['risk_level'] = 'Low'
                elif 'etf' in security['name'].lower() or 'fund' in security['name'].lower():
                    security['security_type'] = 'ETF'
                    security['asset_class'] = 'Funds'
                    security['risk_level'] = 'Medium'
                else:
                    security['security_type'] = 'Equity'
                    security['asset_class'] = 'Stocks'
                    security['risk_level'] = 'Medium'
                
                securities.append(security)
        
        return securities
    
    def analyze_portfolio(self, securities):
        """Analyze the portfolio based on extracted securities."""
        if not securities:
            return {
                'total_value': 0.0,
                'currency': 'USD',
                'security_count': 0,
                'risk_profile': 'Unknown',
                'diversification_score': 0.0,
                'asset_allocation': {},
                'recommendations': []
            }
        
        # Calculate total value
        total_value = sum(security['value'] for security in securities)
        
        # Calculate asset allocation
        asset_classes = {}
        for security in securities:
            asset_class = security['asset_class']
            if asset_class in asset_classes:
                asset_classes[asset_class] += security['value']
            else:
                asset_classes[asset_class] = security['value']
        
        asset_allocation = {asset_class: round(value / total_value * 100, 1) 
                           for asset_class, value in asset_classes.items()}
        
        # Determine risk profile
        risk_levels = [security['risk_level'] for security in securities]
        risk_counts = {
            'Low': risk_levels.count('Low'),
            'Medium': risk_levels.count('Medium'),
            'High': risk_levels.count('High')
        }
        
        if risk_counts['High'] > len(securities) * 0.3:
            risk_profile = 'Aggressive'
        elif risk_counts['Low'] > len(securities) * 0.5:
            risk_profile = 'Conservative'
        else:
            risk_profile = 'Moderate'
        
        # Calculate diversification score (0-100)
        # Higher score means better diversification
        asset_class_count = len(asset_classes)
        security_count = len(securities)
        
        # More asset classes and securities = better diversification
        diversification_base = min(asset_class_count * 10, 50) + min(security_count * 2, 30)
        
        # Penalize for concentration in a single asset class
        max_allocation = max(asset_allocation.values()) if asset_allocation else 100
        concentration_penalty = max(0, (max_allocation - 50) / 2)
        
        diversification_score = max(0, min(100, diversification_base - concentration_penalty))
        
        # Generate recommendations
        recommendations = []
        
        if max_allocation > 60:
            recommendations.append(f"Consider reducing concentration in {max(asset_allocation, key=asset_allocation.get)} to improve diversification.")
        
        if 'Fixed Income' not in asset_allocation or asset_allocation.get('Fixed Income', 0) < 20:
            recommendations.append("Consider increasing fixed income allocation for better diversification.")
        
        if risk_profile == 'Aggressive' and risk_counts['High'] > 2:
            recommendations.append("The portfolio has a high risk profile. Consider adding more conservative investments.")
        
        if diversification_score < 50:
            recommendations.append("The portfolio has low diversification. Consider adding more asset classes and securities.")
        
        if not recommendations:
            recommendations.append(f"The portfolio has a {risk_profile.lower()} risk profile suitable for long-term growth.")
        
        return {
            'total_value': round(total_value, 2),
            'currency': 'USD',
            'security_count': security_count,
            'risk_profile': risk_profile,
            'diversification_score': round(diversification_score, 1),
            'asset_allocation': asset_allocation,
            'recommendations': recommendations
        }
    
    def process_pdf(self, pdf_path):
        """Process a PDF file and extract financial data."""
        # Extract text
        text = self.extract_text(pdf_path)
        
        # Extract ISINs
        isins = self.extract_isins(text)
        
        # Extract tables
        tables = self.extract_tables(pdf_path)
        
        # Extract security details
        securities = self.extract_security_details(text, isins)
        
        # Analyze portfolio
        portfolio_analysis = self.analyze_portfolio(securities)
        
        return {
            'isins': isins,
            'tables': tables,
            'securities': securities,
            'portfolio_analysis': portfolio_analysis
        }
    
    def save_results(self, results, filename):
        """Save processing results to a JSON file."""
        output_path = os.path.join(self.results_folder, f"{filename}.json")
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        return output_path
    
    def export_to_csv(self, securities, filename):
        """Export securities to a CSV file."""
        if not securities:
            return None
        
        df = pd.DataFrame(securities)
        output_path = os.path.join(self.results_folder, f"{filename}.csv")
        df.to_csv(output_path, index=False)
        return output_path


# Example usage
if __name__ == "__main__":
    processor = PDFProcessor()
    
    # Example PDF path
    pdf_path = "example.pdf"
    
    if os.path.exists(pdf_path):
        results = processor.process_pdf(pdf_path)
        print(f"Found {len(results['isins'])} ISINs")
        print(f"Found {len(results['securities'])} securities")
        print(f"Portfolio value: ${results['portfolio_analysis']['total_value']}")
        
        # Save results
        processor.save_results(results, "example_results")
        
        # Export to CSV
        processor.export_to_csv(results['securities'], "example_securities")
    else:
        print(f"File not found: {pdf_path}")
