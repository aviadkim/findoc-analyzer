"""
Security query handler for FinDocRAG.
"""

def handle_specific_security_query(query, context):
    """Handle queries about specific securities."""
    # Find which ISIN is mentioned in the query
    specific_isin = None
    for isin in context.get('isins', []):
        if isin in query:
            specific_isin = isin
            break
    
    if not specific_isin:
        return "I couldn't identify a specific security in your question. Please mention the ISIN of the security you're asking about."
    
    # Find the security with this ISIN
    security = None
    for sec in context.get('securities', []):
        if sec.get('identifier') == specific_isin:
            security = sec
            break
    
    if not security:
        return f"Could not find details for security with ISIN {specific_isin}."
    
    # Prepare the answer based on the query
    if 'value' in query.lower():
        return f"Security with ISIN {specific_isin} ({security.get('name', 'Unknown')}) has a value of {security.get('value', 0):,.2f} {context['portfolio_analysis'].get('currency', 'EUR')}."
    elif 'name' in query.lower():
        return f"Security with ISIN {specific_isin} is named '{security.get('name', 'Unknown')}'."
    elif 'type' in query.lower() or 'asset' in query.lower() or 'class' in query.lower():
        return f"Security with ISIN {specific_isin} ({security.get('name', 'Unknown')}) is a {security.get('security_type', 'Unknown')} in the {security.get('asset_class', 'Unknown')} asset class."
    else:
        # General information about the security
        return f"Security with ISIN {specific_isin}:\n" + \
               f"Name: {security.get('name', 'Unknown')}\n" + \
               f"Value: {security.get('value', 0):,.2f} {context['portfolio_analysis'].get('currency', 'EUR')}\n" + \
               f"Asset Class: {security.get('asset_class', 'Unknown')}\n" + \
               f"Security Type: {security.get('security_type', 'Unknown')}"
