"""
Verification Agent for financial data.

This agent is responsible for verifying the accuracy of extracted financial data
and providing confidence scores and suggestions for improvements.
"""
import os
import logging
import json
import re
from typing import Dict, List, Any, Optional
import google.generativeai as genai

# Import the financial knowledge base
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'knowledge'))
from financial_knowledge import FinancialDocumentKnowledge

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VerificationAgent:
    """
    Agent for verifying financial data accuracy.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the verification agent.
        
        Args:
            api_key: Gemini API key
        """
        self.api_key = api_key or os.environ.get('GEMINI_API_KEY')
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Initialized Gemini Pro model for verification")
        else:
            logger.warning("No API key provided, Gemini Pro model not initialized")
            self.model = None
        
        # Initialize the financial knowledge base
        self.knowledge = FinancialDocumentKnowledge()
    
    def verify_securities(self, securities: List[Dict[str, Any]], portfolio_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify extracted securities for accuracy.
        
        Args:
            securities: List of extracted securities
            portfolio_summary: Portfolio summary information
            
        Returns:
            Verification results
        """
        # Calculate sum of security values
        total_value = 0
        for security in securities:
            if 'actual_value' in security:
                try:
                    value = float(str(security['actual_value']).replace(',', '').replace("'", ""))
                    total_value += value
                except ValueError:
                    pass
        
        # Get portfolio total from summary
        portfolio_total = 0
        if 'total_value' in portfolio_summary:
            try:
                portfolio_total = float(str(portfolio_summary['total_value']).replace(',', '').replace("'", ""))
            except ValueError:
                pass
        
        # Check if total matches portfolio value
        value_match = False
        if portfolio_total > 0:
            value_match = abs(total_value - portfolio_total) / portfolio_total < 0.05
        
        # Verify individual securities
        verified_securities = []
        for security in securities:
            # Validate security
            validation = self.knowledge.validate_security_data(security)
            
            # Add validation results to security
            security['validation'] = validation
            
            # Add confidence score
            if validation['isin_valid'] and validation['value_calculation_valid'] and validation['data_complete']:
                security['confidence'] = 'high'
            elif validation['isin_valid'] and (validation['value_calculation_valid'] or validation['data_complete']):
                security['confidence'] = 'medium'
            else:
                security['confidence'] = 'low'
            
            verified_securities.append(security)
        
        # Calculate overall confidence
        high_confidence_count = sum(1 for s in verified_securities if s.get('confidence') == 'high')
        medium_confidence_count = sum(1 for s in verified_securities if s.get('confidence') == 'medium')
        low_confidence_count = sum(1 for s in verified_securities if s.get('confidence') == 'low')
        
        total_count = len(verified_securities)
        if total_count == 0:
            overall_confidence = 'none'
        elif high_confidence_count / total_count >= 0.8:
            overall_confidence = 'high'
        elif (high_confidence_count + medium_confidence_count) / total_count >= 0.8:
            overall_confidence = 'medium'
        else:
            overall_confidence = 'low'
        
        return {
            'securities': verified_securities,
            'total_verification': {
                'extracted_total': total_value,
                'portfolio_total': portfolio_total,
                'match': value_match,
                'difference_percentage': abs(total_value - portfolio_total) / portfolio_total * 100 if portfolio_total > 0 else None
            },
            'confidence': {
                'overall': overall_confidence,
                'high_confidence_count': high_confidence_count,
                'medium_confidence_count': medium_confidence_count,
                'low_confidence_count': low_confidence_count,
                'total_count': total_count
            }
        }
    
    def get_improvement_suggestions(self, verification_results: Dict[str, Any]) -> List[str]:
        """
        Get suggestions for improving extraction accuracy.
        
        Args:
            verification_results: Verification results
            
        Returns:
            List of improvement suggestions
        """
        suggestions = []
        
        # Check total verification
        total_verification = verification_results.get('total_verification', {})
        if not total_verification.get('match', False):
            suggestions.append("The sum of security values does not match the portfolio total. Check for missing securities or incorrect values.")
        
        # Check confidence
        confidence = verification_results.get('confidence', {})
        if confidence.get('overall', 'none') != 'high':
            suggestions.append(f"Overall confidence is {confidence.get('overall', 'low')}. Improve extraction accuracy.")
        
        # Check individual securities
        securities = verification_results.get('securities', [])
        low_confidence_securities = [s for s in securities if s.get('confidence') == 'low']
        
        if low_confidence_securities:
            suggestions.append(f"There are {len(low_confidence_securities)} securities with low confidence. Review these securities.")
            
            # Add specific suggestions for each low confidence security
            for security in low_confidence_securities:
                isin = security.get('isin', 'Unknown')
                validation = security.get('validation', {})
                
                if not validation.get('isin_valid', False):
                    suggestions.append(f"Security with ISIN {isin} has an invalid ISIN. Check the ISIN format.")
                
                if not validation.get('value_calculation_valid', False):
                    suggestions.append(f"Security with ISIN {isin} has an invalid value calculation. Check the nominal, price, and value.")
                
                if not validation.get('data_complete', False):
                    suggestions.append(f"Security with ISIN {isin} has incomplete data. Check for missing fields.")
        
        return suggestions
    
    def verify_with_ai(self, securities: List[Dict[str, Any]], portfolio_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify extracted data using AI.
        
        Args:
            securities: List of extracted securities
            portfolio_summary: Portfolio summary information
            
        Returns:
            AI verification results
        """
        if not self.model:
            logger.error("Gemini Pro model not initialized")
            return {"error": "Model not initialized"}
        
        prompt = """
        I'm going to verify the accuracy of extracted financial data using sequential thinking.
        
        STEP 1: Check individual securities
        - Verify that each security has all required fields
        - Validate ISINs for correct format
        - Check if value calculations make sense (value ≈ nominal * price / 100)
        
        STEP 2: Check portfolio totals
        - Calculate the sum of security values
        - Compare with the portfolio total from the summary
        - Identify any discrepancies
        
        STEP 3: Identify and resolve issues
        - Flag securities with missing or invalid data
        - Suggest corrections for issues
        - Provide confidence scores for each security
        
        Here are the extracted securities:
        {securities}
        
        Here is the portfolio summary:
        {portfolio_summary}
        
        Please verify the accuracy of the extracted data and provide:
        1. Verification results for each security
        2. Portfolio total verification
        3. Overall confidence score
        4. Suggestions for improvements
        
        Format the output as a JSON object.
        """
        
        try:
            response = self.model.generate_content(
                prompt.format(
                    securities=json.dumps(securities, indent=2),
                    portfolio_summary=json.dumps(portfolio_summary, indent=2)
                )
            )
            
            # Parse the response
            try:
                verification = json.loads(response.text)
                return verification
            except json.JSONDecodeError:
                # If not valid JSON, extract JSON-like content
                json_match = re.search(r'```json\n(.*?)\n```', response.text, re.DOTALL)
                if json_match:
                    try:
                        verification = json.loads(json_match.group(1))
                        return verification
                    except json.JSONDecodeError:
                        pass
                
                # Return text as fallback
                return {"verification": response.text}
        
        except Exception as e:
            logger.error(f"Error verifying with AI: {str(e)}")
            return {"error": str(e)}
    
    def verify_extraction(self, extraction_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify extraction results.
        
        Args:
            extraction_results: Extraction results
            
        Returns:
            Verification results
        """
        securities = extraction_results.get('securities', [])
        portfolio_summary = extraction_results.get('portfolio_summary', {})
        
        # Verify securities
        verification_results = self.verify_securities(securities, portfolio_summary)
        
        # Get improvement suggestions
        suggestions = self.get_improvement_suggestions(verification_results)
        
        # Add suggestions to verification results
        verification_results['suggestions'] = suggestions
        
        # If AI verification is available, use it
        if self.model:
            ai_verification = self.verify_with_ai(securities, portfolio_summary)
            verification_results['ai_verification'] = ai_verification
        
        return verification_results

# Example usage
if __name__ == "__main__":
    # Initialize agent
    agent = VerificationAgent()
    
    # Example securities
    securities = [
        {
            "isin": "US0378331005",
            "description": "Apple Inc.",
            "nominal_value": 100,
            "price": 190.50,
            "actual_value": 19050,
            "currency": "USD",
            "type": "equity"
        },
        {
            "isin": "US5949181045",
            "description": "Microsoft Corp.",
            "nominal_value": 50,
            "price": 380.20,
            "actual_value": 19010,
            "currency": "USD",
            "type": "equity"
        }
    ]
    
    # Example portfolio summary
    portfolio_summary = {
        "total_value": 38060,
        "currency": "USD",
        "valuation_date": "31.12.2023"
    }
    
    # Verify extraction
    verification_results = agent.verify_extraction({
        "securities": securities,
        "portfolio_summary": portfolio_summary
    })
    
    print("Verification Results:")
    print(json.dumps(verification_results, indent=2))
